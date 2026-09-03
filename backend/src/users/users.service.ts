import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/database/entities/product.entity';
import { CreateUserDto } from './dto';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Busca el usuario por telegramId. Si no existe, lo crea.
   * NO guarda telegramBotToken porque es el token global del bot
   * y tiene unique:true — todos los usuarios comparten el mismo token.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Si ya existe, retornarlo directamente
    const existing = await this.findByTelegramId(createUserDto.telegramId);
    if (existing) return existing;

    // 2. Crear sin telegramBotToken (es el token del bot, no del usuario)
    try {
      const user = this.usersRepository.create({
        telegramId: createUserDto.telegramId,
        username: createUserDto.username ?? null,
        fullName: createUserDto.fullName ?? null,
        // telegramBotToken: omitido — es compartido por todos, no es dato del usuario
      });
      return await this.usersRepository.save(user);
    } catch (err) {
      // 23505 = unique_violation (race condition con doble /start)
      if (err?.code === '23505') {
        return await this.findByTelegramId(createUserDto.telegramId);
      }
      throw err;
    }
  }

  async createAccount(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    username?: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      email: data.email,
      password: data.password, // ya viene hasheado desde AuthService
      username: data.username ?? null,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['products', 'userPlan', 'userPlan.plan'],
    });
  }

  async findOne(id: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['products', 'userPlan', 'userPlan.plan'],
    });
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { telegramId },
      relations: ['userPlan', 'userPlan.plan'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'isActive', 'hasPlan'], // password incluido a propósito, solo aquí
    });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { username },
      relations: ['products', 'userPlan', 'userPlan.plan'],
    });
  }

  async update(
    id: string,
    updateUserDto: {
      username?: string;
      firstName?: string;
      isActive?: boolean;
      hasPlan?: boolean;
    },
  ): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async getUserProducts(userId: string): Promise<Product[]> {
    const user = await this.findOne(userId);
    return user?.products || [];
  }

  async deactivate(id: string): Promise<User> {
    return await this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<User> {
    return await this.update(id, { isActive: true, hasPlan: true });
  }

  async setHasPlan(id: string, hasPlan: boolean): Promise<void> {
    await this.usersRepository.update(id, { hasPlan });
  }

  async saveTelegramCredentials(
    userId: string,
    telegramApiId: string,
    telegramApiHash: string,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      telegramApiId,
      telegramApiHash,
    });
  }

  async hasTelegramCredentials(telegramId: string): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    return !!(user?.telegramApiId && user?.telegramApiHash);
  }
  /**
   * Guarda el número de teléfono del usuario
   */
  async savePhoneNumber(id: string, phoneNumber: string): Promise<void> {
    await this.usersRepository.update(id, { phoneNumber });
  }
}
