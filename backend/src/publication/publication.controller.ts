import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PublicationService } from './publication.service';

@Controller('publications')
export class PublicationController {
  constructor(private service: PublicationService) {}

  @Post()
  async create(@Body() body: any) {
    return await this.service.create(body);
  }

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }

  @Patch(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    return await this.service.toggleActive(id);
  }

  @Post(':id/products/:productId')
  async addProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return await this.service.addProduct(id, productId);
  }

  @Delete(':id/products/:productId')
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return await this.service.removeProduct(id, productId);
  }
}
