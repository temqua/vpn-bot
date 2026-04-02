import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database.service';
import { CreateUsersServerDto } from './dto/create-users-server.dto';

@Injectable()
export class UsersServersRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(createUserServerDto: CreateUsersServerDto) {
    return await this.databaseService.client.serversUsers.create({
      data: {
        ...createUserServerDto,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }

  async findAll() {
    return await this.databaseService.client.serversUsers.findMany({
      include: {
        server: {},
        user: {},
      },
    });
  }

  async findOne(id: number) {
    return await this.databaseService.client.serversUsers.findFirst({
      where: {
        id,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }

  async remove(id: number) {
    return await this.databaseService.client.serversUsers.delete({
      where: {
        id,
      },
    });
  }
}
