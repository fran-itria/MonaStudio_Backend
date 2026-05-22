import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory])],
  exports: [TypeOrmModule],
})
export class ProductCategoriesModule {}
