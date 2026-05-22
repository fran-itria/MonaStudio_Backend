import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';

const domainModules =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        UsersModule,
        AuthModule,
        ProductsModule,
        CategoriesModule,
        ProductCategoriesModule,
      ];

const databaseImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const rawPort = configService.get<string>('DB_PORT', '5432');
            return {
              type: 'postgres',
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: Number(rawPort),
              username: configService.get<string>('DB_USERNAME', 'postgres'),
              password: configService.get<string>('DB_PASSWORD', 'postgres'),
              database: configService.get<string>('DB_DATABASE', 'monastudio'),
              autoLoadEntities: true,
              synchronize:
                configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
            };
          },
        }),
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
