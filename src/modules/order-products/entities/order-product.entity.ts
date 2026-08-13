import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { Varity } from '../../varities/entities/varity.entity';

@Entity('order_products')
@Check(`"quantity" > 0`)
export class OrderProduct {
  @PrimaryColumn({ type: 'uuid' })
  orderId!: string;

  @PrimaryColumn({ type: 'uuid' })
  productId!: string;

  @PrimaryColumn({ type: 'uuid' })
  varityId!: string;

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
}
