import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.entity';
import { Repository } from 'typeorm';
import { OllamaService } from 'src/ollama/ollama.service';
import { ImagesService } from 'src/images/images.service';
import { ProductCaption } from 'src/commons/interfaces';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private repo: Repository<Product>,
    private ollamaService: OllamaService,
    private imageService: ImagesService,
  ) {}

  async create(dto: {
    caption: ProductCaption;
    buffer: Buffer<any>;
    fileName: string;
    userId?: string;
  }) {
    const { name, description, price, cant } = dto.caption;
    const embedding = await this.ollamaService.embed(`${name}. ${description}`);
    const imageUrl = await this.imageService.saveFromTelegram(dto.fileName, dto.buffer);

    const product = this.repo.create({
      name,
      description,
      price: Number(price),
      cant: Number(cant),
      imageUrl,
      embedding,
      userId: dto.userId ?? null,
    });

    return this.repo.save(product);
  }

  async update(id: string, dto) {
    const product = await this.repo.findOneBy({ id });
    if (dto.name || dto.description) {
      product.embedding = await this.ollamaService.embed(
        `${dto.name ?? product.name}. ${dto.description ?? product.description}`,
      );
    }
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async findOne(id: string) {
    return await this.repo.findOneBy({ id });
  }

  /**
   * Obtiene todos los productos.
   * Si se pasa userId, solo retorna los del usuario.
   */
  async findAll(enable: boolean = false, userId?: string) {
    const where: any = {};
    if (!enable) where.available = true;
    if (userId) where.userId = userId;
    return await this.repo.find({ where });
  }

  async remove(id: string) {
    return await this.repo.delete(id);
  }

  async findBestMatch(messageEmbedding: number[]) {
    const best: Product[] = [];
    let bestScore = 0;
    const products = await this.findAll(true);
    for (const p of products) {
      const score = this.cosine(messageEmbedding, p.embedding);
      if (score > bestScore) {
        best.push(p);
        bestScore = score;
      }
    }
    return bestScore > 0.5 ? best : null;
  }

  cosine(a: number[], b: number[]) {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (na * nb);
  }

  async listProducts(limit = 10, userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.repo.find({ where, take: limit, order: { name: 'ASC' } });
  }
}
