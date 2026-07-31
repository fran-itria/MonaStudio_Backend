import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { DataSource, EntityNotFoundError, In, QueryFailedError, Repository } from "typeorm";
import Create_order_dto from "./dto/createOrder.dto";
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions";
import { OrderErrors } from "../../Errors/order.errors";
import BadRequestForCreateOrder, { reduceStock } from "./services";
import { Product } from "../products/entities/product.entity";
import { PorductErrors } from "../../Errors/product.errors";
import { ProductVarity } from "../product-varity/entities/product-varity.entity";

export class OrderServices {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly datasource: DataSource
    ) { }

    async create(info: Create_order_dto): Promise<string | void> {
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
                const updateStock = await reduceStock(products, manager)
                return "Prueba exitosa"
            })
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw ErrorsExceptions.notFound(PorductErrors.NOT_FOUND_ANY_PRODUCT.errorCode, `${PorductErrors.NOT_FOUND_ANY_PRODUCT.message}`)
            }
            throw error
        }
    }
}