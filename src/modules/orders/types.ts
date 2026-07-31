import { EntityManager } from "typeorm";
import { Product } from "../products/entities/product.entity";

export interface ReduceStockProps {
    products: {
        id: string;
        quantity?: number | undefined;
        varityId?: {
            id: "string";
            quantity: number;
        }[] | undefined;
    }[],
    manager: EntityManager
}

export interface SelectionsProps {
    varityId: {
        id: "string";
        quantity: number;
    }[] | undefined;
    components: Product["components"];
    productVarities: Product["productVarities"];
    quantity: number
}

export interface ProductsPrices {
    price: number,
    discountedPrice: number | null,
    quantity: number
}
