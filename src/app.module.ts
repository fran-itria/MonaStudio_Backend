import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { databaseImports } from './config/database-imports';

const isTestEnvironment = process.env.NODE_ENV === 'test';

const domainModules = isTestEnvironment
  ? []
  : [
      UsersModule,
      AuthModule,
      ProductsModule,
      CategoriesModule,
      ProductCategoriesModule,
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...(isTestEnvironment ? [] : databaseImports),
    ...domainModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
