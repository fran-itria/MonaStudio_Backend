import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_products')
export class OrderProduct {
  @PrimaryColumn({ type: 'uuid' })
  orderId: string;

  @PrimaryColumn({ type: 'uuid' })
  productId: string;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
