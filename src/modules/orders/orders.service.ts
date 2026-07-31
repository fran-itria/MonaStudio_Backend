import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { DataSource, EntityNotFoundError, Repository } from "typeorm";
import Create_order_dto from "./dto/createOrder.dto";
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions";
import reduceStock from "./services/reduce-stock";
import { PorductErrors } from "../../Errors/product.errors";
import { VarityErrors } from "../../Errors/varity.errors";
import createOrderErrors from "./services/create-order-errors";

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
        createOrderErrors({ products, delivered, shippingData })

        try {
            return await this.datasource.transaction(async (manager) => {
                const updateStock = await reduceStock(products, manager)
                return "Prueba exitosa"
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
}