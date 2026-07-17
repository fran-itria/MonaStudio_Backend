import { Module } from '@nestjs/common';
import { ProductComponentService } from './product-component.service';
import { ProductComponentController } from './product-component.controller';
import { ProductComponent } from './entities/product-component.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProductComponent])],
  controllers: [ProductComponentController],
  providers: [ProductComponentService],
})
export class ProductComponentModule { }
