import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrderServices } from './orders.service';
import { Payment } from '../payment/entities/payment.entity';
import { Webhook } from '../payment/entities/webhooks.entity';
import { AuthModule } from '../auth/auth.module';
import { MercadoPagoWebhookCronService } from './services/mercadopago-webhook-cron';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, Webhook]), AuthModule],
  controllers: [OrdersController],
  providers: [OrderServices, MercadoPagoWebhookCronService],
  exports: [TypeOrmModule],
})
export class OrdersModule { }
