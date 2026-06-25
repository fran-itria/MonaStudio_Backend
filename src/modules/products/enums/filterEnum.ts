

export class FilterEnum {
    static readonly ACTIVE = {
        IN_CATALOG: 'inCatalog',
        OUT_CATALOG: 'outCatalog'
    } as const;

    static readonly ORDER_BY = {
        NOMBRE: 'nombre',
        PRICE: 'price',
        STOCK: 'stock',
        DISCOUNTED_PRICE: 'discountedPrice',
        CREATED_AT: 'createdAt'
    } as const;

    static readonly DIRECTION = {
        ASC: 'ASC',
        DESC: 'DESC'
    } as const;
}