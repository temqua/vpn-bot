import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UsersService {
  constructor(private repository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    return await this.repository.create(createUserDto);
  }

  async findAll(dto: SearchUserDto) {
    if (dto.username) {
      return await this.repository.findByUsername(dto.username);
    }
    if (dto.firstName) {
      return await this.repository.findByFirstName(dto.firstName);
    }
    if (dto.telegramId) {
      return await this.repository.getByTelegramId(dto.telegramId);
    }

    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const user = await this.repository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findUnpaid() {
    return await this.repository.getUnpaidUsers();
  }

  async findTrial() {
    return await this.repository.getTrialUsers();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.repository.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }

  async getUserPayments(id: string) {
    return await this.repository.getUserPayments(Number(id));
  }

  async getLastUserPayment(id: string) {
    return await this.repository.getLastUserPayment(Number(id));
  }

  async getUserServers(id: number) {
    return await this.repository.listUserServers(id);
  }
}
