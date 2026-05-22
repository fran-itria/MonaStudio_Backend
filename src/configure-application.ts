import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApplication(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MonaStudio API')
    .setDescription(
      'API for managing MonaStudio products, services, and courses',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, swaggerDocument, {
    jsonDocumentUrl: '/api-json',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
