import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as bodyParser from 'body-parser';

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
  // no hacer process.exit() — solo loguear y seguir vivo
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  app.enableCors({ origin: 'http://localhost:3000' });

  const config = new DocumentBuilder()
    .setTitle('API de Ejemplo')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001);
}
bootstrap();
