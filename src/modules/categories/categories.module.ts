import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, ProductCategory])],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
