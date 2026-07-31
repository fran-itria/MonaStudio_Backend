import { EntityManager, In } from "typeorm"
import { ErrorsExceptions } from "../../../Errors/custom-errors-exceptions"
import { OrderErrors } from "../../../Errors/order.errors"
import Create_order_dto, { Delivered } from "../dto/createOrder.dto"
import { Product } from "../../products/entities/product.entity"
import { ProductVarity } from "../../product-varity/entities/product-varity.entity"
import { SelectionMode } from "../../product-component/entities/product-component.entity"
import { PorductErrors } from "../../../Errors/product.errors"
import { VarityErrors } from "../../../Errors/varity.errors"
import { ProductsPrices } from "../types"

export default async function reduceStock(
    products: {
        id: string;
        quantity?: number | undefined;
        varityId?: {
            id: "string";
            quantity: number;
        }[] | undefined;
    }[],
    manager: EntityManager
) {
    const productsPrices: ProductsPrices[] = []
    for (const product of products) {
        const find = await manager.findOneOrFail(Product, {
            where: {
                id: product.id
            },
            relations: {
                productVarities: true,
                components: true
            }
        })

        if (!find.stock) throw ErrorsExceptions.badRequest("SOLD_OUT", `Stock agotado de: ${find.nombre}`)

        const quantity = product.quantity ?? 1
        if (quantity > find.stock) {
            const error = PorductErrors.INSUFICIENT_STOCK(find.stock, find.nombre)
            throw ErrorsExceptions.conflict(error.errorCode, error.message)
        }

        const selections = product.varityId?.reduce((acc, current) => {
            return acc += current.quantity
        }, 0) ?? 0

        let requiredSelections: number = 0
        if (find.components.length) {
            const customComponent = find.components.find(
                c => c.selectionMode === SelectionMode.CUSTOM
            );

            if (customComponent) {
                requiredSelections = customComponent.selectionQuantity || 0;
            }

            for (const component of find.components) {
                await manager.decrement(
                    Product,
                    {
                        id: component.componentId
                    },
                    "stock",
                    component.stockReduce * quantity || 1
                )
            }
        } else if (find.productVarities.length > 0) {
            requiredSelections = 1;
        }

        if (selections == requiredSelections * quantity) {
            await manager.decrement(
                Product,
                {
                    id: find.id
                },
                "stock",
                product.quantity || 1
            )

            if (product.varityId?.length) {
                for (const varity of product.varityId) {
                    const find = await manager.findOneOrFail(ProductVarity, {
                        where: {
                            id: varity.id
                        },
                        relations: {
                            varity: true,
                        }
                    })
                    if (varity.quantity > find.stock) {
                        console.log(find)
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
        } else {
            const error = OrderErrors.BAD_REQUEST_SELECTIONS(requiredSelections * quantity)
            throw ErrorsExceptions.badRequest(error.erroCode, error.message)
        }
        productsPrices.push({ price: find.price, discountedPrice: find.discountedPrice })
    }
    return productsPrices
}