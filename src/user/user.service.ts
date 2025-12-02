import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

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
