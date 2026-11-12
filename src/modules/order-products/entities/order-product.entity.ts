import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Varity } from '../../varities/entities/varity.entity';

@Entity('order_products')
@Check(`"quantity" > 0`)
export class OrderProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  /** Variedad elegida. Es null cuando el producto no tiene variedades. */
  @Column({ type: 'uuid', nullable: true })
  varityId!: string | null;

  @Column({ type: 'integer', default: 1, nullable: false })
  quantity!: number;

  @ManyToOne(() => Order, (order) => order.orderProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orderProducts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @ManyToOne(() => Varity, (varity) => varity.orderProducts, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'varityId' })
  varity!: Varity;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
