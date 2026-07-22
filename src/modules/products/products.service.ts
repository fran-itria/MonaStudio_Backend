import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm/repository/Repository.js";
import { CreateProductDto } from "./dto/create-product-dto";
import { DataSource, FindOptionsWhere, QueryFailedError } from "typeorm";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UpdateProductDto } from "./dto/update-product-dto";
import { ProductVarity } from "../product-varity/entities/product-varity.entity";
import { ErrorsExceptions } from "../../Errors/custom-errors-exceptions";
import { PorductErrors } from "../../Errors/product.errors";
import { ProductImage } from "../product-image/entities/product-image.entity";
import { ProductVarityImage } from "../varity-image/entities/varity-image.entity";
import { Varity } from "../varities/entities/varity.entity";
import { ProductComponentService } from "../product-component/product-component.service";
import { SelectionMode } from "../product-component/entities/product-component.entity";

export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource,
        private readonly prodcutComponentService: ProductComponentService
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
            .leftJoinAndSelect('product.images', 'product_image')
            .leftJoinAndSelect('product.productVarities', 'productVarity')
            .leftJoinAndSelect('productVarity.varity', 'varity');

        categoryName && query.where('category.name = :categoryName', { categoryName })
        active && query.andWhere('product.active = :active', { active: active === 'inCatalog' ? true : false })
        if (orderBy && allowedFields.includes(orderBy)) {
            query.orderBy(`product.${orderBy}`, direction as 'ASC' | 'DESC')
        } else throw new BadRequestException(`El campo '${orderBy}' no es válido para ordenar.`);
        query.addOrderBy('product.nombre', 'ASC')
            .skip((page - 1) * limit)
            .take(limit)

        return await query.getMany()
    }

    async findById(id: FindOptionsWhere<Product>) {
        const query = this.productRepository
            .createQueryBuilder('product')
            .where(id)
            .leftJoinAndSelect('product.categories', 'category')
            .leftJoinAndSelect('product.images', 'product_image')
            .leftJoinAndSelect('product.productVarities', 'productVarity')
            .leftJoinAndSelect('productVarity.images', 'image')
            .leftJoinAndSelect('productVarity.varity', 'varity')
            .leftJoinAndSelect('product.components', 'components')
            .leftJoinAndSelect('components.component', 'productComponent')
            .leftJoinAndSelect('productComponent.productVarities', 'varities')
            .leftJoinAndSelect('varities.varity', 'varityInfo')

        const product = await query.getOne()
        if (!product) throw new NotFoundException()
        let requiredSelections: number | null = 0
        if (product.components.length > 0) {
            const customComponent = product.components.find(
                c => c.selectionMode === SelectionMode.CUSTOM
            );

            if (customComponent) {
                requiredSelections = customComponent.selectionQuantity;
            }
        } else if (product.productVarities.length > 0) {
            requiredSelections = 1;
        }
        let varitiesProduct: {
            id: string,
            name: string,
            stock: number,
            images: string[]
        }[] | undefined = undefined
        if (!product.productVarities.length) {
            product.components.forEach(com =>
                varitiesProduct = com.component.productVarities.map(varity => {
                    return {
                        id: varity.id,
                        name: varity.varity.name,
                        stock: varity.stock,
                        active: varity.active,
                        images: varity.images?.map(image => image.url)
                    }
                }))
        } else {
            varitiesProduct = product.productVarities.map(varity => {
                return {
                    id: varity.id,
                    name: varity.varity.name,
                    stock: varity.stock,
                    active: varity.active,
                    images: varity.images?.map(image => image.url)
                }
            })
        }
        const productReturn = {
            id: product.id,
            nombre: product.nombre,
            price: product.price,
            stock: product.stock,
            discountedPrice: product.discountedPrice,
            description: product.description,
            active: product.active,
            realatedProducts: product.relatedProducts,
            complementProducts: product.complementProducts,
            sections: product.section,
            categories: product.categories.map(c => c.name),
            varities: varitiesProduct,
            requiredSelections,
        }
        return productReturn
    }

    async create(productData: CreateProductDto): Promise<Product | void> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const { image, varities } = productData;
                const product = manager.create(Product, { ...productData, categories: productData.categories.map(id => ({ id })) });
                await manager.save(product);
                if (image && image.length > 0) {
                    for (const img of image) {
                        const newImage = manager.create(ProductImage, { productId: product.id, url: img });
                        await manager.save(newImage);
                    }
                }
                let sotckWithVarities = 0
                if (varities && varities.length > 0) {
                    for (const { name, stock, image } of varities) {
                        sotckWithVarities += stock
                        let varity = await manager.findOne(Varity, {
                            where: { name }
                        })
                        if (!varity) {
                            varity = manager.create(Varity, { name });
                            await manager.save(varity);
                        }
                        const newVarityInProduct = manager.create(ProductVarity, {
                            stock: stock,
                            product: { id: product.id },
                            varity: { id: varity.id }
                        })
                        await manager.save(newVarityInProduct)
                        if (image) {
                            const newImage = manager.create(ProductVarityImage, { productVarityId: newVarityInProduct.id, url: image });
                            await manager.save(newImage);
                        }
                    }
                    product.stock = sotckWithVarities
                    await manager.save(product);
                }
                if (productData.productsComponent) {
                    for (const productComponent of productData.productsComponent) {
                        await this.prodcutComponentService.create(manager, { ...productComponent, productId: product.id });
                    }
                }
                return product
            })
        }
        catch (error) {
            if (error instanceof QueryFailedError) {
                if (error.message.includes('duplicate key value') && error.driverError.detail.includes('nombre')) {
                    throw new BadRequestException('El producto ya está registrado.');
                }
            }
            throw error
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
            const product = await manager.findOne(Product, {
                where: {
                    id
                },
            });

            if (!product) throw ErrorsExceptions.notFound(PorductErrors.NOT_FOUND_PRODUCT.errorCode, PorductErrors.NOT_FOUND_PRODUCT.message)
            if (data.categories !== undefined && data.categories.length > 0) {
                product.categories = data.categories.map(id => ({ id })) as any;
            }

            let stock = 0
            if (data.varities !== undefined && data.varities.length > 0) {
                for (const varity of data.varities) {
                    const varityInProduct = await manager.findOne(ProductVarity, {
                        where: {
                            product: { id: product.id },
                            varity: { id: varity.id }
                        }
                    })
                    if (varityInProduct) {
                        if (varity.stock != 0) {
                            stock += varity.stock;
                            varityInProduct.stock = varity.stock;
                        }
                        else {
                            varityInProduct.stock = varity.stock;
                            varityInProduct.active = false
                        }
                        await manager.save(varityInProduct)
                    } else {
                        stock += varity.stock;
                        const newVarityInProduct = manager.create(ProductVarity, {
                            stock: varity.stock,
                            product: { id: product.id },
                            varity: { id: varity.id }
                        })
                        await manager.save(newVarityInProduct)
                    }
                }
            }
            Object.assign(product, data)
            product.stock = stock
            return await manager.save(product);
        });
    }

    async bulkUpdate(productsData: UpdateProductDto[]): Promise<Product[] | void> {
        return this.dataSource.transaction(async (manager) => {
            const products = await Promise.all(
                productsData.map(async ({ id, ...data }) => {
                    const product = await manager.findOne(Product, {
                        where: {
                            id
                        },
                    });

                    if (!product) throw ErrorsExceptions.notFound(PorductErrors.NOT_FOUND_PRODUCT.errorCode, PorductErrors.NOT_FOUND_PRODUCT.message)
                    if (data.categories !== undefined && data.categories.length > 0) {
                        product.categories = data.categories.map(id => ({ id })) as any;
                    }

                    if (data.varities !== undefined && data.varities.length > 0) {
                        product.stock = undefined
                        for (const varity of data.varities) {
                            const varityInProduct = await manager.findOne(ProductVarity, {
                                where: {
                                    product: { id: product.id },
                                    varity: { id: varity.id }
                                }
                            })
                            if (varityInProduct) {
                                varityInProduct.stock = varity.stock
                                varityInProduct.active = varity.active
                                await manager.save(varityInProduct)
                            } else {
                                const newVarityInProduct = manager.create(ProductVarity, {
                                    stock: varity.stock,
                                    active: true,
                                    product: { id: product.id },
                                    varity: { id: varity.id }
                                })
                                await manager.save(newVarityInProduct)
                            }
                        }
                    }

                    Object.assign(product, data);
                    return manager.save(product);
                }),
            );

            return products;
        });
    }


    async bulkUpdateStocks(products: { id: string }[]): Promise<Product[] | void> {
        const query = this.productRepository
            .createQueryBuilder('product')
            .where('product.id IN (:...ids)', { ids: products.map(p => p.id) })
            .leftJoinAndSelect('product.productVarities', 'productVarity')
        const productsDb = await query.getMany();
        for (const product of productsDb) {
            if (product.productVarities && product.productVarities.length > 0) {
                const totalStock = product.productVarities.reduce((acc, varity) => acc + varity.stock, 0);
                product.stock = totalStock;
                await this.productRepository.save(product);
            }
        }
        return productsDb;
    }
}