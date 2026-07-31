import { ProductsPrices } from "../types";


export default function calculatePrice(products: ProductsPrices[]) {
    return products.reduce((acc, curr) => {
        return acc += (
            (curr.discountedPrice ? curr.discountedPrice : curr.price)
            * curr.quantity
        )
    }, 0)
}