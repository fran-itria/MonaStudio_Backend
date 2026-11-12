import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { ProductVarity } from "../../product-varity/entities/product-varity.entity";
import { OrderProduct } from "../../order-products/entities/order-product.entity";


@Entity('varity')
@Unique(['name'])
export class Varity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: "varchar", length: 255 })
    name!: string

    @OneToMany(() => ProductVarity, (productVarity) => productVarity.varity)
    productVarities!: ProductVarity[]

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.varity)
    orderProducts!: OrderProduct[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
