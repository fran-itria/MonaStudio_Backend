import { EntityManager } from "typeorm"
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

    for (const product of products) {

        const quantity = product.quantity ?? 1
        const find = await productError(manager, product.id, quantity)

        const { validateSelection, requiredSelections } = validateProductSelections({
            varityId: product.varityId,
            components: find.components,
            productVarities: find.productVarities,
            quantity
        })

        if (validateSelection) {
            await productReduceStock(manager, find.id, quantity)
            await varitiesReduceStock(manager, product.varityId)
            await componentReduceStock(manager, find.components, quantity)
        } else {
            const error = OrderErrors.BAD_REQUEST_SELECTIONS(requiredSelections * quantity)
            throw ErrorsExceptions.badRequest(error.erroCode, error.message)
        }

        productsPrices.push({ price: find.price, discountedPrice: find.discountedPrice })
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
    await manager.decrement(
        Product,
        {
            id: id
        },
        "stock",
        quantity
    )
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
            await manager.decrement(
                Product,
                {
                    id: component.componentId
                },
                "stock",
                component.stockReduce * quantity || 1
            )
        }
}