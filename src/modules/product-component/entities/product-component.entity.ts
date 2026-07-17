import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { ProductVarity } from "../../product-varity/entities/product-varity.entity";

export enum SelectionMode {
    FIXED = "fixed",
    CUSTOM = "custom"
}

@Entity("product_component")
export class ProductComponent {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column({ type: "uuid" })
    productId!: string

    @Column({ type: "uuid", nullable: true })
    varityId!: string

    @Column({ type: "uuid" })
    componentId!: string

    @Column({ name: "stock_reduce", type: "integer" })
    stockReduce!: number

    @Column({ name: "selection_mode", type: "enum", enum: SelectionMode })
    selectionMode!: SelectionMode

    @Column({ name: "selection_quantity", type: "integer", nullable: true })
    selectionQuantity!: number | null

    @ManyToOne(() => Product, product => product.components, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'productId' })
    product!: Product;

    @ManyToOne(() => ProductVarity, varity => varity.components, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'varityId' })
    varity!: ProductVarity;

    @ManyToOne(() => Product, {
        eager: true,
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'componentId' })
    component!: Product;
}