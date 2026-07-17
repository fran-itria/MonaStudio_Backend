import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Varity } from "../../varities/entities/varity.entity";
import { ProductVarityImage } from "../../varity-image/entities/varity-image.entity";
import { ProductComponent } from "../../product-component/entities/product-component.entity";


@Entity('product_varity')
@Unique(['product', 'varity'])
export class ProductVarity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: "integer" })
    stock!: number

    @Column({ type: 'boolean', default: true })
    active!: boolean

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

    @OneToMany(
        () => ProductComponent,
        (productComponent) => productComponent.varity,
        {
            cascade: true,
        },
    )
    components!: ProductComponent[];

    @OneToMany(() => ProductVarityImage, (productVarityImage) => productVarityImage.iamge)
    images!: ProductVarityImage[];
}