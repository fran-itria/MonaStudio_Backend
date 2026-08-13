export enum WebhookStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', default: 'mercadopago' })
    provider!: string;

    @Column({ type: 'varchar', nullable: true })
    provider_event_id!: string | null;

    @Column({ type: 'varchar' })
    payment_id!: string;

    @Column({ type: 'varchar', nullable: true })
    type!: string | null;

    @Column({ type: 'varchar', nullable: true })
    action!: string | null;

    @Column({
        type: 'enum',
        enum: WebhookStatus,
        default: WebhookStatus.PENDING,
    })
    status!: WebhookStatus;

    @Column({
        type: 'integer',
        default: 0,
    })
    retry_count!: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    last_error!: string | null;

    @Column({
        type: 'jsonb',
    })
    payload!: any;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    last_attempt_at!: Date | null;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    processed_at!: Date | null;

    @CreateDateColumn()
    received_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}