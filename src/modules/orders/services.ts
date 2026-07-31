import { EntityManager, In } from "typeorm"
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions"
import { OrderErrors } from "../../Errors/order.errors"
import Create_order_dto, { Delivered } from "./dto/createOrder.dto"
import { Product } from "../products/entities/product.entity"
import { ProductVarity } from "../product-varity/entities/product-varity.entity"
import { SelectionMode } from "../product-component/entities/product-component.entity"



export default function BadRequestForCreateOrder({
    products,
    delivered,
    shippingData
}: Pick<Create_order_dto, "delivered" | "shippingData" | "products">) {
    if (products && products?.length < 1) {
        throw ErrorsExceptions.badRequest(OrderErrors.BAD_REQUEST_PRODUCTS.errorCode, OrderErrors.BAD_REQUEST_PRODUCTS.message)
    }

    if (delivered == Delivered.CADETE && !shippingData) {
        throw ErrorsExceptions.badRequest(OrderErrors.BAD_REQUEST_SHIPPING.errorCode, OrderErrors.BAD_REQUEST_SHIPPING.message)
    }
}


export async function reduceStock(
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

            return 204
        } else {
            const error = OrderErrors.BAD_REQUEST_SELECTIONS(requiredSelections * quantity)
            throw ErrorsExceptions.badRequest(error.erroCode, error.message)
        }
    }
}