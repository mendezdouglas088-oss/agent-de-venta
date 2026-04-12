import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users - Crear un nuevo usuario
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return await this.usersService.create(createUserDto);
  }

  /**
   * GET /users - Obtener todos los usuarios
   */
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  /**
   * GET /users/:id - Obtener un usuario por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  /**
   * GET /users/:id/products - Obtener todos los productos de un usuario
   */
  @Get(':id/products')
  async getUserProducts(@Param('id') id: string) {
    return await this.usersService.getUserProducts(id);
  }

  /**
   * PATCH /users/:id - Actualizar un usuario
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateUserDto: {
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    },
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id - Eliminar un usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  /**
   * PATCH /users/:id/activate - Activar un usuario
   */
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    return await this.usersService.activate(id);
  }

  /**
   * PATCH /users/:id/deactivate - Desactivar un usuario
   */
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return await this.usersService.deactivate(id);
  }
}
