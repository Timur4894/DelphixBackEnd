import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: signupDto.email },
        { user_name: signupDto.user_name },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(signupDto.password, saltRounds);

    // Создаем пользователя
    const user = this.userRepository.create({
      email: signupDto.email,
      password_hash,
      user_name: signupDto.user_name,
    });

    const savedUser = await this.userRepository.save(user);

    // Генерируем JWT токен
    const payload = { sub: savedUser.id, email: savedUser.email };
    const access_token = this.jwtService.sign(payload);

    // Возвращаем пользователя без пароля и токен
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        user_name: savedUser.user_name,
        avatar: savedUser.avatar,
        created_at: savedUser.created_at,
      },
      access_token,
    };
  }

  async login(loginDto: LoginDto) {
    // Находим пользователя по email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Генерируем JWT токен
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    // Возвращаем пользователя без пароля и токен
    return {
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        avatar: user.avatar,
        created_at: user.created_at,
      },
      access_token,
    };
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}

