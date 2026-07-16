import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { ProductImage } from '../product-image/entities/product-image.entity';
import { ProductVarity } from '../product-varity/entities/product-varity.entity';
import { ProductComponent } from '../product-component/entities/product-component.entity';
import { ProductImageService } from '../product-image/product-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductVarity, ProductComponent]), AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule],
})
export class ProductsModule { }
