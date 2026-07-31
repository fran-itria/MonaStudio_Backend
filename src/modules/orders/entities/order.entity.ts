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

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'accept',
  FAILED = 'rejected',
  DELIVERED = 'delivered',
}

interface ShippingInfo {
  street: string,
  number: number,
  floor?: number,
  letter?: string
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  client_name!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  client_surname!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  phone!: string;

  @Column({ type: 'numeric' })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ type: 'varchar', length: 150, nullable: true })
  coment!: string | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  state!: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  shipping?: ShippingInfo | null;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts!: OrderProduct[];
}
