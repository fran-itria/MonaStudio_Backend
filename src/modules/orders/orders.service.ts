import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { DataSource, EntityNotFoundError, In, Repository } from "typeorm";
import Create_order_dto from "./dto/createOrder.dto";
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions";
import { OrderErrors } from "../../Errors/order.errors";
import BadRequestForCreateOrder from "./services";
import { Product } from "../products/entities/product.entity";
import { PorductErrors } from "../../Errors/product.errors";

export class OrderServices {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly datasource: DataSource
    ) { }

    async create(info: Create_order_dto): Promise<Product[] | void> {
        const {
            client_name,
            client_surname,
            delivered,
            phone,
            products,
            shippingData
        } = info
        BadRequestForCreateOrder({ products, delivered, shippingData })

        try {
            return await this.datasource.transaction(async (manager) => {
                const productsInDb: Product[] = []
                for (const product of products) {
                    const find = await manager.findOneByOrFail(Product, {
                        id: product.id
                    })
                    if (find)
                        productsInDb.push(find)
                }
                return productsInDb
            })
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                const id = error.message.split(' ').at(-1)?.replaceAll(/[\\"\r\n}]/g, '')
                throw ErrorsExceptions.notFound(PorductErrors.NOT_FOUND_PRODUCT.errorCode, `${PorductErrors.NOT_FOUND_PRODUCT.message}: ${id}`)
            }
            throw error
        }
    }
}