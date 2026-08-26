import { Inject, Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class ImagesService {
  constructor(@Inject('MINIO') private minio: Client) {}

  private readonly bucket = 'products';
  private basePath = join(process.cwd(), 'images');

  private async ensureBucket() {
    const exists = await this.minio.bucketExists(this.bucket);
    if (!exists) {
      await this.minio.makeBucket(this.bucket);
    }
  }

  async upload(originalname: string, buffer: Buffer) {
    await this.ensureBucket();

    const name = `${Date.now()}-${originalname}`;
    await this.minio.putObject('products', name, buffer);
    return `http://localhost:9000/products/${name}`;
  }

  async saveFromTelegram(originalName: string, buffer: Buffer) {
    await fs.mkdir(this.basePath, { recursive: true });

    const filename = `${Date.now()}-${originalName}`;
    const filepath = join(this.basePath, filename);

    await fs.writeFile(filepath, buffer);

    // return `http://localhost:3000/uploads/products/${filename}`;
    return filepath;
  }
}
