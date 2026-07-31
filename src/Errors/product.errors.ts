


export class PorductErrors {
    static readonly NOT_FOUND_PRODUCT = { message: "No se encontró el producto", errorCode: "NOT_FOUND_PRODUCT" }
    static readonly NOT_FOUND_ANY_PRODUCT = { message: "No se encontró alguno de los producto", errorCode: "NOT_FOUND_ANY_PRODUCT" }
    static readonly INSUFICIENT_STOCK = (stock: number, product: string) => ({ message: `No hay stock disponible de ${product.toLocaleUpperCase()} para completar su pedido, quedan ${stock} unidades disponible`, errorCode: "INSUFICIENT_STOCK" })
}