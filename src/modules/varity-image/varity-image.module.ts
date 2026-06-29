import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductVarityImage } from './entities/varity-image.entity';
import { ProductVarityImageController } from './varity-image.controller';
import { ProductVarityImageService } from './varity-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVarityImage]), AuthModule],
  controllers: [ProductVarityImageController],
  providers: [ProductVarityImageService],
})
export class ProductVarityImageModule { }
