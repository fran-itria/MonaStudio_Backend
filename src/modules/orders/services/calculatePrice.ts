import { ProductsPrices } from "../types";

/** Precio unitario efectivo: el descuento solo cuenta si es mayor a 0 (los numeric llegan como string, y "0" es truthy). */
export function unitPrice(price: number | string, discountedPrice: number | string | null) {
    const discount = Number(discountedPrice)
    return discount > 0 ? discount : Number(price)
}

export default function calculatePrice(products: ProductsPrices[]) {
    return products.reduce((acc, curr) => acc + unitPrice(curr.price, curr.discountedPrice) * curr.quantity, 0)
}
