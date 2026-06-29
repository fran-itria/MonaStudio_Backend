import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductVarity } from "../../product-varity/entities/product-varity.entity";


@Entity('varity_image')
export class ProductVarityImage {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'uuid' })
    productVarityId!: string;

    @Column({ type: "varchar", length: "255" })
    url!: string

    @ManyToOne(() => ProductVarity, (product) => product.images, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'productVarityId' })
    iamge!: ProductVarityImage;
}