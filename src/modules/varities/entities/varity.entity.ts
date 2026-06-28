import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { ProductVarity } from "../../product-varity/entities/product-varity.entity";


@Entity('varity')
@Unique(['name'])
export class Varity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: "varchar", length: 255 })
    name!: string

    @OneToMany(() => ProductVarity, (productVarity) => productVarity.varity)
    productVarities!: ProductVarity[]
}