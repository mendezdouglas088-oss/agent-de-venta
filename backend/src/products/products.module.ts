import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.entity';
import { OllamaModule } from 'src/ollama/ollama.module';
import { OllamaService } from 'src/ollama/ollama.service';
import { ImagesService } from 'src/images/images.service';
import { ImagesModule } from 'src/images/images.module';
import { MinioProvider } from 'src/images/minio.providers';

@Module({
  imports: [OllamaModule, TypeOrmModule.forFeature([Product]), ImagesModule],
  providers: [ProductsService, OllamaService, ImagesService, MinioProvider],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
