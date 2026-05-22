import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { databaseImports } from './database/database-imports';

const domainModules =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        UsersModule,
        AuthModule,
        ProductsModule,
        CategoriesModule,
        ProductCategoriesModule,
        OrdersModule,
      ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseImports,
    ...domainModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
