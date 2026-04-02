import { Injectable } from '@nestjs/common';
import { CreateUsersServerDto } from './dto/create-users-server.dto';
import { UsersServersRepository } from './users-servers.repository';

@Injectable()
export class UsersServersService {
  constructor(private repository: UsersServersRepository) {}

  async create(createUsersServerDto: CreateUsersServerDto) {
    return await this.repository.create(createUsersServerDto);
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async remove(id: number) {
    return await this.repository.remove(id);
  }
}
