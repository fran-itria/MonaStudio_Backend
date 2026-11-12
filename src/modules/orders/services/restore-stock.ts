import { EntityManager, In } from "typeorm"
import { OrderProduct } from "../../order-products/entities/order-product.entity"
import { Product } from "../../products/entities/product.entity"
import { ProductVarity } from "../../product-varity/entities/product-varity.entity"
import { SelectionMode } from "../../product-component/entities/product-component.entity"

/**
 * Devuelve el stock que descontó reduceStock al crear la orden (se usa al rechazarla):
 * - el stock propio del producto o promo
 * - el stock de cada variedad elegida (del producto o, en promos, del producto componente)
 * - el stock de los productos que forman la promo (stockReduce x cantidad)
 *
 * order_products guarda una fila por variedad, así que la cantidad del producto se reconstruye
 * igual que en buildPreferenceItems. Si un producto o variedad estaba sin stock (y por eso oculto),
 * vuelve a quedar visible.
 */
export default async function restoreStock(manager: EntityManager, orderId: string) {
    const rows = await manager.find(OrderProduct, {
        where: { orderId },
        relations: { product: { components: true } },
    })

    const groups = new Map<string, OrderProduct[]>()
    for (const row of rows) groups.set(row.productId, [...(groups.get(row.productId) ?? []), row])

    for (const [productId, productRows] of groups) {
        const components = productRows[0].product?.components ?? []
        const custom = components.find(c => c.selectionMode === SelectionMode.CUSTOM)
        const perPromo = custom?.selectionQuantity && custom.selectionQuantity > 0 ? custom.selectionQuantity : 1
        const units = productRows.reduce((acc, r) => acc + Number(r.quantity), 0)
        const quantity = Math.max(1, Math.round(units / perPromo))

        await addProductStock(manager, productId, quantity)

        for (const component of components) {
            await addProductStock(manager, component.componentId, (component.stockReduce * quantity) || 1)
        }

        const owners = [productId, ...components.map(c => c.componentId)]
        for (const row of productRows) {
            if (!row.varityId) continue
            const productVarity = await manager.findOne(ProductVarity, {
                where: { varity: { id: row.varityId }, product: { id: In(owners) } },
            })
            if (!productVarity) continue
            productVarity.stock += Number(row.quantity)
            productVarity.active = productVarity.stock > 0
            await manager.save(productVarity)
        }
    }
}

async function addProductStock(manager: EntityManager, id: string, quantity: number) {
    const product = await manager.findOneBy(Product, { id })
    if (!product) return
    const wasSoldOut = !product.stock
    product.stock = (product.stock ?? 0) + quantity
    if (wasSoldOut) product.active = true
    await manager.save(product)
}
