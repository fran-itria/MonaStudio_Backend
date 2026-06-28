import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../products/entities/product.entity";


@Entity('product_image')
export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'uuid' })
    productId!: string;

    @Column({ type: "varchar", length: "255" })
    url!: string

    @ManyToOne(() => Product, (product) => product.images, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'productId' })
    product!: Product;
}