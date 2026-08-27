import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('API de Ejemplo')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addTag('users') // Etiqueta para agrupar los endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
