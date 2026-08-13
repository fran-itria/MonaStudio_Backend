import { InjectRepository } from "@nestjs/typeorm";
import { Order, OrderStatus, PaymentStatus } from "./entities/order.entity";
import { DataSource, EntityNotFoundError, Repository } from "typeorm";
import Create_order_dto from "./dto/createOrder.dto";
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions";
import reduceStock from "./services/reduce-stock";
import { PorductErrors } from "../../Errors/product.errors";
import { VarityErrors } from "../../Errors/varity.errors";
import createOrderErrors from "./services/create-order-errors";
import calculatePrice from "./services/calculatePrice";
import MercadoPagoConfig, { Preference } from "mercadopago"
import { OrderProduct } from "../order-products/entities/order-product.entity";
import { ProductVarity } from "../product-varity/entities/product-varity.entity";
import { OrderErrors } from "../../Errors/order.errors";
import { Payment } from "../payment/entities/payment.entity";
import { Webhook, WebhookStatus } from "../payment/entities/webhooks.entity";
export class OrderServices {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Webhook)
        private readonly webhookRepository: Repository<Webhook>,
        private readonly datasource: DataSource
    ) { }

    async create(info: Create_order_dto): Promise<Order | void> {
        const {
            client_name,
            client_surname,
            delivered,
            phone,
            products,
            shippingData,
            coment,
            paymentMethod
        } = info
        createOrderErrors({ products, delivered, shippingData })

        try {
            return await this.datasource.transaction(async (manager) => {
                const productsPrice = await reduceStock({ products, manager })
                let price = 0

                if (productsPrice.length) {
                    price = calculatePrice(productsPrice)
                }

                const order = manager.create(Order, {
                    client_name,
                    client_surname,
                    amount: price,
                    coment,
                    shipping: shippingData,
                    phone,
                    paymentMethod
                })
                await manager.save(order)

                for (const product of products) {
                    const orderId = order.id
                    const productId = product.id
                    if (product.varityId?.length) {
                        for (const varity of product.varityId) {
                            const productVarity = await manager.findOneOrFail(ProductVarity,
                                {
                                    where: {
                                        id: varity.id
                                    },
                                    relations: {
                                        varity: true
                                    }
                                }
                            )
                            const orderProduct = manager.create(OrderProduct, {
                                orderId,
                                quantity: varity.quantity,
                                varityId: productVarity.varity.id,
                                productId
                            })
                            await manager.save(orderProduct)
                        }
                    } else {
                        const orderProduct = manager.create(OrderProduct, {
                            orderId,
                            productId: productId,
                            quantity: product.quantity
                        })
                        await manager.save(orderProduct)
                    }
                }
                return order
            })
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                const entity = error.entityClass.toString().split(" ")[1]
                if (entity == "Product")
                    throw ErrorsExceptions.notFound(PorductErrors.NOT_FOUND_ANY_PRODUCT.errorCode, PorductErrors.NOT_FOUND_ANY_PRODUCT.message)
                if (entity == "ProductVarity")
                    throw ErrorsExceptions.notFound(VarityErrors.NOT_FOUND_VARITY.errorCode, VarityErrors.NOT_FOUND_VARITY.message)
            }
            throw error
        }
    }

    async createPreference(orderId: string) {
        try {
            const order = await this.orderRepository.findOne(
                {
                    where: { id: orderId },
                    relations: {
                        orderProducts: {
                            product: true
                        }
                    }
                }
            )
            if (!order)
                throw ErrorsExceptions.notFound(OrderErrors.NOT_FOUND.errorCode, OrderErrors.NOT_FOUND.message)
            const items: {
                id: string,
                title: string,
                quantity: number,
                unit_price: number
            }[] = []
            order.orderProducts.forEach(product => {
                const findIndex = items.findIndex(item => item.id == product.productId)
                if (findIndex == -1) {
                    items.push({
                        id: product.productId,
                        title: product.product.nombre,
                        quantity: Number(product.quantity),
                        unit_price: 2000
                    })
                } else if (!items[findIndex].title.includes("2x")) {
                    items[findIndex].quantity += product.quantity
                }
            })
            const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN_SANDBOX! });
            const preference = new Preference(client)

            const api = process.env.PUBLIC_ORIGIN

            const newPreference = await preference.create({
                body: {
                    items,
                    notification_url: `${api}/api/v1/orders/webhook/mercadopago`,
                    external_reference: order.id
                },
            })
            return newPreference
        }
        catch (error) {
            throw error
        }
    }


    async registerMercadoPagoWebhook(data: {
        providerEventId: string | null;
        paymentId: string;
        type: string;
        action: string | null;
        payload: any;
    }) {
        const webhook = this.webhookRepository.create({
            provider: 'mercadopago',
            provider_event_id: data.providerEventId,
            payment_id: data.paymentId,
            type: data.type,
            action: data.action,
            payload: data.payload,
            status: WebhookStatus.PENDING,
            retry_count: 0,
            last_error: null,
            last_attempt_at: null,
            processed_at: null
        });

        return await this.webhookRepository.save(webhook);
    }


    async processMercadoPagoWebhook(webhookId: string) {
        const webhook = await this.webhookRepository.findOne({
            where: {
                id: webhookId,
            },
        });

        if (!webhook)
            return

        if (
            webhook.status === WebhookStatus.COMPLETED ||
            webhook.status === WebhookStatus.FAILED
        )
            return;


        try {
            webhook.last_attempt_at = new Date();

            await this.webhookRepository.save(webhook);

            const response = await fetch(`https://api.mercadopago.com/v1/payments/${webhook.payment_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.ACCESS_TOKEN_SANDBOX}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(
                    `Mercado Pago retorno ${response.status}`,
                );
            }

            const paymentData = await response.json();
            const mercadoPagoId = paymentData.id
            const orderId = paymentData.external_reference
            const status = paymentData.status
            const status_detail = paymentData.status_detail
            const amount = Number(paymentData.transaction_amount);

            const order = await this.orderRepository.findOneByOrFail({ id: orderId })
            if (!order) throw ErrorsExceptions.notFound(OrderErrors.NOT_FOUND.errorCode, OrderErrors.NOT_FOUND.message)

            if (
                Number(order.amount) !== amount
            ) {
                throw new Error(
                    `Monto diferido. ` +
                    `Orden: ${order.amount}, Pago: ${amount}`,
                );
            }

            await this.datasource.transaction(async manager => {
                const paymentRepository = manager.getRepository(Payment);
                const orderRepository = manager.getRepository(Order);
                const webhookRepository = manager.getRepository(Webhook);

                // PAGO
                let payment = await paymentRepository.findOne({ where: { mercado_pago_id: mercadoPagoId } })
                if (!payment) {
                    payment = this.paymentRepository.create({
                        mercado_pago_id: String(mercadoPagoId),
                        order_id: orderId,
                        state: PaymentStatus.PAID,
                        information: paymentData,
                        amount
                    });
                } else {
                    payment.state = status;
                    payment.amount = amount;
                    payment.information = paymentData;
                }
                await paymentRepository.save(payment)

                // ORDEN
                if (
                    status === 'approved' &&
                    status_detail === 'accredited'
                ) {
                    if (order.paymentStatus !== PaymentStatus.PAID) {
                        await orderRepository.update(order.id, {
                            state: OrderStatus.PAID,
                            paymentStatus: PaymentStatus.PAID,
                        });
                    }
                }

                // WEBHOOK
                await webhookRepository.update(
                    webhook.id,
                    {
                        status: WebhookStatus.COMPLETED,
                        processed_at: new Date(),
                        last_error: null
                    },
                );

            })

            console.log(status, status_detail, orderId, mercadoPagoId)

        } catch (error) {
            console.error('Error processing webhook from MercadoPago:', error);
            const message = error instanceof Error ? error.message : String(error);

            const retryCount = webhook.retry_count + 1;

            await this.webhookRepository.update(
                webhook.id,
                {
                    retry_count: retryCount,
                    last_error: message,
                    last_attempt_at: new Date(),
                    status: retryCount >= 10 ? WebhookStatus.FAILED : WebhookStatus.PENDING
                },
            );
            throw error
        }
    }
}