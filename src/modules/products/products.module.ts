import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory])],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
