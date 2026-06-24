import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { OrderProduct } from '../../order-products/entities/order-product.entity';

type ProductIdReference = { id: string };

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 150, unique: true })
  nombre!: string;

  @Column({ type: 'numeric' })
  price!: number;

  @Column({ type: 'text', array: true, nullable: true })
  image!: string[] | null;

  @Column({ type: 'integer', nullable: true })
  stock?: number;

  @Column({ type: 'numeric', nullable: true })
  discountedPrice!: number | null;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  varities?: { name: string, stock: number }[] | null;

  @Column({ type: 'jsonb', nullable: true })
  relatedProducts!: ProductIdReference[] | null;

  @Column({ type: 'jsonb', nullable: true })
  complementProducts!: ProductIdReference[] | null;

  @Column({ type: 'text', array: true, nullable: true })
  section!: string[] | null;

  @ManyToMany(() => Category, (category) => category.products, {
    cascade: false,
  })
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories!: Category[];

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orderProducts!: OrderProduct[];
}
