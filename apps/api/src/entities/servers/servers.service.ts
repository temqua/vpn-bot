import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { ServersRepository } from './servers.repository';

@Injectable()
export class ServersService {
  constructor(private repository: ServersRepository) {}

  async create(createServerDto: CreateServerDto) {
    return await this.repository.create(
      createServerDto.name,
      createServerDto.url,
    );
  }

  async findAll() {
    return await this.repository.getAll();
  }

  async findOne(id: number) {
    const server = await this.repository.getById(id);
    if (!server) {
      throw new NotFoundException(`Server with id ${id} not found`);
    }
    return server;
  }

  async update(id: number, updateServerDto: UpdateServerDto) {
    return await this.repository.update(id, updateServerDto);
  }

  async remove(id: number) {
    return await this.repository.delete(id);
  }

  async getUsers(id: number) {
    return await this.repository.getUsers(id);
  }
}
