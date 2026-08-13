import { EntityManager, MoreThanOrEqual } from "typeorm"
import { ErrorsExceptions } from "../../../Errors/custom-errors-exceptions"
import { OrderErrors } from "../../../Errors/order.errors"
import { Product } from "../../products/entities/product.entity"
import { ProductVarity } from "../../product-varity/entities/product-varity.entity"
import { SelectionMode } from "../../product-component/entities/product-component.entity"
import { PorductErrors } from "../../../Errors/product.errors"
import { VarityErrors } from "../../../Errors/varity.errors"
import { ProductsPrices, ReduceStockProps, SelectionsProps } from "../types"

export default async function reduceStock({ products, manager }: ReduceStockProps) {
    const productsPrices: ProductsPrices[] = []

    for (const productOrder of products) {

        const quantity = productOrder.quantity ?? 1
        const productInDb = await productError(manager, productOrder.id, quantity)

        const { validateSelection, requiredSelections } = validateProductSelections({
            varityId: productOrder.varityId,
            components: productInDb.components,
            productVarities: productInDb.productVarities,
            quantity
        })

        if (validateSelection) {
            await productReduceStock(manager, productInDb.id, quantity)
            await varitiesReduceStock(manager, productOrder.varityId)
            await componentReduceStock(manager, productInDb.components, quantity)
        } else {
            const error = OrderErrors.BAD_REQUEST_SELECTIONS(requiredSelections * quantity)
            throw ErrorsExceptions.badRequest(error.erroCode, error.message)
        }

        productsPrices.push({
            price: productInDb.price,
            discountedPrice: productInDb.discountedPrice,
            quantity
        })
    }
    return productsPrices
}


const productError = async (manager: EntityManager, id: string, quantity = 1) => {
    const find = await manager.findOneOrFail(Product, {
        where: {
            id
        },
        relations: {
            productVarities: true,
            components: true
        }
    })

    if (!find.stock) throw ErrorsExceptions.badRequest("SOLD_OUT", `Stock agotado de: ${find.nombre}`)

    if (quantity > find.stock) {
        const error = PorductErrors.INSUFICIENT_STOCK(find.stock, find.nombre)
        throw ErrorsExceptions.conflict(error.errorCode, error.message)
    }

    return find
}

const validateProductSelections = ({ varityId, components, productVarities, quantity }: SelectionsProps) => {
    const selections = varityId?.reduce((acc, current) => {
        return acc += current.quantity
    }, 0) ?? 0

    let requiredSelections: number = 0
    if (components.length) {
        const customComponent = components.find(
            c => c.selectionMode === SelectionMode.CUSTOM
        );

        if (customComponent) {
            requiredSelections = customComponent.selectionQuantity || 0;
        }
    } else if (productVarities.length > 0) {
        requiredSelections = 1;
    }

    return {
        validateSelection: selections == requiredSelections * quantity,
        requiredSelections
    }
}

const productReduceStock = async (manager: EntityManager, id: string, quantity = 1) => {
    await manager
        .createQueryBuilder()
        .update(Product)
        .set({
            stock: () => '"stock" - :quantity',

            active: () => `
                CASE
                    WHEN "stock" - :quantity = 0
                    THEN false
                    ELSE "active"
                END
            `
        })
        .where("id = :id", { id })
        .andWhere('"stock" >= :quantity', { quantity })
        .setParameter("quantity", quantity)
        .returning([
            "id",
            "stock",
            "active"
        ])
        .execute();
}

const varitiesReduceStock = async (manager: EntityManager, varities: ReduceStockProps["products"][number]["varityId"]) => {
    if (varities?.length)
        for (const varity of varities) {
            const find = await manager.findOneOrFail(ProductVarity, {
                where: {
                    id: varity.id
                },
                relations: {
                    varity: true,
                }
            })
            if (varity.quantity > find.stock) {
                const error = VarityErrors.INSUFICIENT_STOCK(find.varity.name)
                throw ErrorsExceptions.conflict(error.errorCode, error.message)
            }
            if (varity.quantity == find.stock)
                await manager.update(ProductVarity, { id: varity.id }, { active: false })
            await manager.decrement(
                ProductVarity,
                {
                    id: varity.id
                },
                "stock",
                varity.quantity
            )
        }
}

const componentReduceStock = async (manager: EntityManager, components: Product["components"], quantity = 1) => {
    if (components.length)
        for (const component of components) {
            const result = await manager.decrement(
                Product,
                {
                    id: component.componentId,
                    stock: MoreThanOrEqual(component.stockReduce)
                },
                "stock",
                component.stockReduce * quantity || 1
            )
            if (!result.affected) {
                const error = PorductErrors.INSUFICIENT_STOCK(component.stockReduce, component.productId)
                throw ErrorsExceptions.conflict("INSUFICIENT_STOCK", "Stock insuficiente en alguno de los productos del combo/oferta")
            }
        }
}