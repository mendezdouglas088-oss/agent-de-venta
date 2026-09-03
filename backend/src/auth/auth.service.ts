import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { PlansService } from 'src/plans/plans.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/database/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Ese email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createAccount({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      username: dto.username,
    });

    await this.plansService.assignFreePlan(user); // mismo comportamiento que el /start del bot viejo

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password)
      throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return {
      accessToken: token,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }
}
