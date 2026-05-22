import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderProduct } from '../../order-products/entities/order-product.entity';

export enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  CARD = 'card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

type CommentState = 'pending' | 'read' | 'answered';

type OrderComment = {
  message: string;
  date: Date;
  name: string;
  state: CommentState;
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
  paymentStatus: PaymentStatus | null;

  @Column({ type: 'jsonb', nullable: true })
  coment: OrderComment | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts: OrderProduct[];
}
