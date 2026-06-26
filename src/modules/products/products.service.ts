import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { CreateProductDto } from "./dto/create-product-dto";
import { DataSource, FindOptionsWhere, QueryFailedError } from "typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UpdateProductDto } from "./dto/update-product-dto";

export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource
    ) { }

    async findAll(
        categoryName: string,
        page = 1,
        limit = 20,
        orderBy = 'createdAt',
        direction = 'DESC',
        active = 'inCatalog'
    ): Promise<Product[]> {
        const allowedFields = ['nombre', 'price', 'stock', 'discountedPrice', 'createdAt'];
        const query = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category')

        categoryName && query.where('category.name = :categoryName', { categoryName })
        active && query.andWhere('product.active = :active', { active: active === 'inCatalog' ? true : false })
        if (orderBy && allowedFields.includes(orderBy)) {
            query.orderBy(`product.${orderBy}`, direction as 'ASC' | 'DESC')
        } else throw new BadRequestException(`El campo '${orderBy}' no es válido para ordenar.`);
        query.addOrderBy('product.nombre', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)

        return query.getMany()
    }

    async findById(id: FindOptionsWhere<Product>) {
        const product = await this.productRepository.findOneBy(id)
        if (!product) throw new NotFoundException()
        return product
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
                const products = productsData.map(productData => manager.create(Product, {
                    ...productData,
                    discountedPrice: (!productData.discountedPrice || productData.discountedPrice == 0) ? null : productData.discountedPrice,
                    stock: (!productData.stock || productData.stock == 0 || (productData.stock && productData.varities?.length)) ? undefined : productData.stock,
                    varities: (!productData.varities || productData.varities.length == 0) ? null : productData.varities,
                    relatedProducts: (!productData.relatedProducts || productData.relatedProducts.length == 0) ? null : productData.relatedProducts,
                    complementProducts: (!productData.complementProducts || productData.complementProducts.length == 0) ? null : productData.complementProducts,
                    section: (!productData.section || productData.section.length == 0) ? null : productData.section,
                    categories: productData.categories.map(id => ({ id }))
                }));
                return await manager.save(products);
            })
        }
        catch (error) {
            if (error instanceof QueryFailedError) {

                if (error.message.includes('duplicate key value') && error.driverError.detail.includes('nombre')) {
                    throw new BadRequestException('Uno o más productos ya están registrados: ' + error.driverError.detail);
                }
            }
        }
    }

    async update(productData: UpdateProductDto): Promise<Product | void> {
        return this.dataSource.transaction(async (manager) => {
            const { id, ...data } = productData;
            const product = await manager.findOneByOrFail(Product, { id });

            Object.assign(product, data);

            if (data.categories !== undefined && data.categories.length > 0) {
                product.categories = data.categories.map(id => ({ id })) as any;
            }

            if (data.varities !== undefined && data.varities.length > 0) {
                product.varities = data.varities;
            }

            return manager.save(product);
        });
    }

    async bulkUpdate(productsData: UpdateProductDto[]): Promise<Product[] | void> {
        return this.dataSource.transaction(async (manager) => {
            const products = await Promise.all(
                productsData.map(async ({ id, ...data }) => {
                    const product = await manager.findOneByOrFail(Product, { id });

                    Object.assign(product, data);

                    if (data.categories !== undefined && data.categories.length > 0) {
                        product.categories = data.categories.map(id => ({ id })) as any;
                    }

                    if (data.varities !== undefined && data.varities.length > 0) {
                        product.varities = data.varities;
                    }

                    return manager.save(product);
                }),
            );

            return products;
        });
    }
}