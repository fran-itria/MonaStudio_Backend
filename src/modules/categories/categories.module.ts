import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { CategoriesController } from './categories.controller';
import { AuthModule } from '../auth/auth.module';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, ProductCategory]), AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [TypeOrmModule],
})
export class CategoriesModule { }
