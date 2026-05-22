import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { ProductsController } from './products.controller';
import { OrderProduct } from '../order-products/entities/order-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory, OrderProduct])],
  controllers: [ProductsController],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
