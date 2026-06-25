import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import hemlet from 'helmet';

export function configureApplication(app: INestApplication): void {
  app.enableCors({
    origin: [
      process.env.LOCALHOST_ORIGIN,
      process.env.PUBLIC_ORIGIN
    ],
    credentials: true
  })
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
      'API para la gestión de la web de MonaStudio',
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
