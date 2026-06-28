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
import { LessonsModule } from './modules/lesson/lessons.module';
import { CoursesModule } from './modules/courses/course.module';
import { ProductImageModule } from "./modules/product-image/product-image.module";
import { VaritiesModule } from './modules/varities/varities.module';
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
      LessonsModule,
      CoursesModule,
      ProductImageModule,
      VaritiesModule
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseImports,
    ...domainModules,
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
