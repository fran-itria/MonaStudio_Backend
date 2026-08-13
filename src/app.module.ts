import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderProductsModule } from './modules/order-products/order-products.module';
import { databaseImports } from './config/database-imports';
import { ProductImageModule } from "./modules/product-image/product-image.module";
import { VaritiesModule } from './modules/varities/varities.module';
import { ProductVarity } from './modules/product-varity/entities/product-varity.entity';
import { ProductVarityImageModule } from './modules/varity-image/varity-image.module';
import { ScheduleModule } from "@nestjs/schedule";


const domainModules =
  process.env.NODE_ENV === 'test'
    ? []
    : [
      UsersModule,
      AuthModule,
      ProductsModule,
      CategoriesModule,
      OrdersModule,
      OrderProductsModule,
      ProductImageModule,
      ProductVarityImageModule,
      VaritiesModule,
      ProductVarity
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ...databaseImports,
    ...domainModules,
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
