export class OrderErrors {
    static readonly BAD_REQUEST_NAME = { message: "El nombre es obligatorio", errorCode: "BAD_REQUEST" }
    static readonly BAD_REQUEST_SURNAME = { message: "El apellido es obligatorio", errorCode: "BAD_REQUEST" }
    static readonly BAD_REQUEST_DELIVERED = { message: "Se debe elegir un método de entrega", errorCode: "BAD_REQUEST" }
    static readonly BAD_REQUEST_PHONE = { message: "Se requiere un teléfono de contacto", errorCode: "BAD_REQUEST" }
    static readonly BAD_REQUEST_PRODUCTS = { message: "Se requiere mínimo un producto para el pedido", errorCode: "BAD_REQUEST" }
    static readonly BAD_REQUEST_SHIPPING = { message: "Los datos de envío son obligatorios", errorCode: "BAD_REQUEST" }
    static readonly BAD_REQUEST_SELECTIONS = (quantity: number) => ({ message: `Debes elegir ${quantity} variedades`, erroCode: "BAD_REQUEST" })
}