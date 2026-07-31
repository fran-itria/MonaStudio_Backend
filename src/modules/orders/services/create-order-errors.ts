import { ErrorsExceptions } from "../../../Errors/custom-errors-exceptions"
import { OrderErrors } from "../../../Errors/order.errors"
import Create_order_dto, { Delivered } from "../dto/createOrder.dto"

export default function CreateOrderErrors({
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