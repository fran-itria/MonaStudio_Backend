import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { CreateProductDto } from "./dto/create-product-dto";
import { DataSource, QueryFailedError } from "typeorm";
import { BadRequestException } from "@nestjs/common";

export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource
    ) { }

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find({
            relations: {
                categories: true
            }
        });
    }

    async create(productData: CreateProductDto): Promise<Product | void> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const product = manager.create(Product, { ...productData, categories: productData.categories.map(id => ({ id })) });
                return await manager.save(product);
            })
        }
        catch (error) {
            if (error instanceof QueryFailedError) {
                if (error.message.includes('duplicate key value') && error.driverError.detail.includes('nombre')) {
                    throw new BadRequestException('El producto ya está registrado.');
                }
            }
        }
    }

    async bulkCreate(productsData: CreateProductDto[]): Promise<Product[] | void> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const products = productsData.map(productData => manager.create(Product, { ...productData, categories: productData.categories.map(id => ({ id })) }));
                return await manager.save(products);
            })
        }
        catch (error) {
            if (error instanceof QueryFailedError) {
                if (error.message.includes('duplicate key value') && error.driverError.detail.includes('nombre')) {
                    throw new BadRequestException('Uno o más productos ya están registrados.');
                }
            }
        }
    }
}