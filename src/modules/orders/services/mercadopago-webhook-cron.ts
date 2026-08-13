import { Injectable, Logger } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';

import { LessThan, Repository } from 'typeorm';
import { OrderServices } from '../orders.service';
import { Webhook, WebhookStatus } from '../../payment/entities/webhooks.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MercadoPagoWebhookCronService {

    private readonly logger = new Logger(MercadoPagoWebhookCronService.name);

    constructor(
        private readonly orderService: OrderServices,
        @InjectRepository(Webhook)
        private readonly webhookRepository: Repository<Webhook>,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async retryPendingWebhooks() {

        this.logger.log('Chqueando webhooks de Mercado Pago pendientes...');

        const pending = await this.webhookRepository.find({
            where: {
                status: WebhookStatus.PENDING,
                retry_count: LessThan(10),
            },
            order: {
                received_at:
                    'ASC',
            },
            take: 50,
        });

        for (const webhook of pending) {
            try {
                await this.orderService.processMercadoPagoWebhook(webhook.id);
            } catch (error) {
                this.logger.error(`Webhook ${webhook.id} failed`);
            }
        }
    }
}