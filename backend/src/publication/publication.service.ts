import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Publication } from '../database/entities/publication.entity';
import { Product } from '../database/entities/product.entity';

@Injectable()
export class PublicationService {
  constructor(
    @InjectRepository(Publication)
    private repo: Repository<Publication>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: {
    name: string;
    description: string;
    productIds?: string[];
    telegramGroupIds?: string[];
    whatsappGroupIds?: string[];
    userId?: string;
  }) {
    const publication = this.repo.create({
      name: dto.name,
      description: dto.description,
      telegramGroupIds: dto.telegramGroupIds || [],
      whatsappGroupIds: dto.whatsappGroupIds || [],
      userId: dto.userId ?? null,
    });

    if (dto.productIds && dto.productIds.length > 0) {
      publication.products = await this.productRepo.findBy({
        id: In(dto.productIds),
      });
    }

    return await this.repo.save(publication);
  }

  /**
   * Lista publicaciones. Si se pasa userId, filtra por usuario.
   */
  async findAll(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    return await this.repo.find({
      where,
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Publicaciones activas para el scheduler.
   * Sin filtro de usuario (el scheduler procesa todas).
   */
  async findAllActive() {
    return await this.repo.find({
      where: { active: true },
      relations: ['products', 'user'], // user.telegramId needed for WhatsApp session
    });
  }

  async findOne(id: string) {
    return await this.repo.findOne({ where: { id }, relations: ['products'] });
  }

  async update(
    id: string,
    dto: {
      name?: string;
      description?: string;
      productIds?: string[];
      telegramGroupIds?: string[];
      whatsappGroupIds?: string[];
      active?: boolean;
    },
  ) {
    const publication = await this.repo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!publication) throw new Error('Publication not found');

    if (dto.name) publication.name = dto.name;
    if (dto.description) publication.description = dto.description;
    if (dto.active !== undefined) publication.active = dto.active;
    if (dto.telegramGroupIds)
      publication.telegramGroupIds = dto.telegramGroupIds;
    if (dto.whatsappGroupIds)
      publication.whatsappGroupIds = dto.whatsappGroupIds;

    if (dto.productIds) {
      publication.products = await this.productRepo.findBy({
        id: In(dto.productIds),
      });
    }

    return await this.repo.save(publication);
  }

  async remove(id: string) {
    return await this.repo.delete(id);
  }

  async toggleActive(id: string) {
    const publication = await this.repo.findOne({ where: { id } });
    if (!publication) throw new Error('Publication not found');
    publication.active = !publication.active;
    return await this.repo.save(publication);
  }

  async addProduct(publicationId: string, productId: string) {
    const publication = await this.repo.findOne({
      where: { id: publicationId },
      relations: ['products'],
    });
    if (!publication) throw new Error('Publication not found');

    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    if (!publication.products.find((p) => p.id === productId)) {
      publication.products.push(product);
      await this.repo.save(publication);
    }
    return publication;
  }

  async removeProduct(publicationId: string, productId: string) {
    const publication = await this.repo.findOne({
      where: { id: publicationId },
      relations: ['products'],
    });
    if (!publication) throw new Error('Publication not found');
    publication.products = publication.products.filter(
      (p) => p.id !== productId,
    );
    return await this.repo.save(publication);
  }
}
