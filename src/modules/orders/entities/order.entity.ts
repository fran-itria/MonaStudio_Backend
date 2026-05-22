import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

type OrderComment = {
  message: string;
  date: Date;
  name: string;
  state: 'pendiente' | 'leido' | 'contestado';
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    nullable: true,
  })
  paymentStatus?: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  coment?: OrderComment;

  @Column({ type: 'varchar', default: 'pendiente' })
  state?: string;
}
