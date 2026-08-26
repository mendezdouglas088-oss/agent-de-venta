import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Post()
  async create(@Body() body) {
    return await this.service.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Get(':enabled')
  async findAll(@Param('enabled') enabled: boolean = null) {
    return await this.service.findAll(enabled);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body) {
    return await this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }
}
