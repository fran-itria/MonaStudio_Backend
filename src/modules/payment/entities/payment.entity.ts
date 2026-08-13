import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';


enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    mercado_pago_id!: string

    @Column({ type: 'string' })
    order_id!: string

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    state!: PaymentStatus;

    @Column({ type: "integer" })
    amount!: number

    @Column({ type: "jsonb" })
    information!: any

    @ManyToOne(() => Order, (order) => order.payments, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "order_id" })
    order!: Order[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
