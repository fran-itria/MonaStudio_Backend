import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Varity } from "../../varities/entities/varity.entity";


@Entity('product_varity')
@Unique(['product', 'varity'])
export class ProductVarity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: "integer" })
    stock!: number

    @ManyToOne(
        () => Product,
        product => product.productVarities,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'productId' })
    product!: Product

    @ManyToOne(
        () => Varity,
        varity => varity.productVarities,
        { onDelete: 'RESTRICT' }
    )
    @JoinColumn({ name: 'varityId' })
    varity!: Varity
}