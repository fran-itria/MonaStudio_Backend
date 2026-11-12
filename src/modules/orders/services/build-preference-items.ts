import { SelectionMode } from "../../product-component/entities/product-component.entity";
import { unitPrice } from "./calculatePrice";

export interface PreferenceItem {
    id: string
    title: string
    quantity: number
    unit_price: number
}

/** Lo mínimo que necesita de la orden (con orderProducts.product.components cargados). */
export interface PreferenceOrder {
    order_number: number
    amount: number | string
    orderProducts: {
        productId: string
        quantity: number
        product: {
            nombre: string
            price: number | string
            discountedPrice: number | string | null
            components?: { selectionMode: SelectionMode, selectionQuantity: number | null }[]
        }
    }[]
}

/**
 * Arma los ítems del pago de Mercado Pago usando el precio con descuento cuando existe,
 * igual que calculatePrice al crear la orden.
 *
 * order_products guarda una fila por variedad elegida, así que la cantidad real se reconstruye:
 * - promo con selección del cliente (custom): filas sumadas / variedades por promo
 * - el resto: suma de las filas
 *
 * El monto guardado en la orden es el que se cobra: si el total de los ítems no coincide
 * (por ejemplo, porque cambió un precio después de crear la orden), se cobra el monto
 * de la orden en un único ítem para que el webhook no lo rechace.
 */
export default function buildPreferenceItems(order: PreferenceOrder): PreferenceItem[] {
    const grouped = new Map<string, { row: PreferenceOrder["orderProducts"][number], units: number }>()
    for (const row of order.orderProducts) {
        const group = grouped.get(row.productId)
        if (group) group.units += Number(row.quantity)
        else grouped.set(row.productId, { row, units: Number(row.quantity) })
    }

    const items: PreferenceItem[] = []
    for (const [productId, { row, units }] of grouped) {
        const custom = row.product.components?.find(c => c.selectionMode === SelectionMode.CUSTOM)
        const perPromo = custom?.selectionQuantity && custom.selectionQuantity > 0 ? custom.selectionQuantity : 1
        items.push({
            id: productId,
            title: row.product.nombre,
            quantity: Math.max(1, Math.round(units / perPromo)),
            unit_price: unitPrice(row.product.price, row.product.discountedPrice),
        })
    }

    const amount = Number(order.amount)
    const total = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
    if (Math.abs(total - amount) > 0.009) {
        return [{
            id: `order-${order.order_number}`,
            title: `Pedido #${order.order_number} - Mona Studio`,
            quantity: 1,
            unit_price: amount,
        }]
    }
    return items
}
