import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import hemlet from 'helmet';

export function configureApplication(app: INestApplication): void {
  app.use(hemlet())

  const prefix = 'api'

  app.setGlobalPrefix(prefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MonaStudio API')
    .setDescription(
      'API for managing MonaStudio products, services, and courses',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(prefix, app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
