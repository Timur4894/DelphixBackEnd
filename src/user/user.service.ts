import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {

    const user = this.usersRepo.create({
      email: createUserDto.email,
      password_hash: createUserDto.password,
      user_name: createUserDto.userName,
    });

    if (await this.usersRepo.findOne({ where: [{ email: createUserDto.email }, { user_name: createUserDto.userName }] })) {
      throw new BadRequestException('User with this email or username already exists');
    }

    return this.usersRepo.save(user).then((user) => ({ user }));
  }

  async getMe(id: number) {
    if (!id) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.usersRepo.findOne({ where: { id } }).then((user) => ({ user }));
  }

  async findAll() {
    return this.usersRepo.find().then((users) => ({ users }));
  }

  async findOne(id: number) {
    return this.usersRepo.findOne({ where: { id } }).then((user) => ({ user }));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepo.update(id, updateUserDto).then(() => ({ message: 'User updated successfully' }));
  }

  async remove(id: number) {
    return this.usersRepo.delete(id).then(() => ({ message: 'User deleted successfully' }));
  }
}
