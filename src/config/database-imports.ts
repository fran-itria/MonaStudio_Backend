import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

const typeOrmDatabaseImport = TypeOrmModule.forRootAsync({
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
});

export const getDatabaseImports = (
  isTestEnvironment: boolean,
): DynamicModule[] => (isTestEnvironment ? [] : [typeOrmDatabaseImport]);
