// images.module.ts
import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { MinioProvider } from './minio.providers';

@Module({
  providers: [MinioProvider, ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
