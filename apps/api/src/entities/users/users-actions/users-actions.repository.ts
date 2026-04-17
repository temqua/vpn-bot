import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database.service';
import { CreateUsersActionDto } from './dto/create-users-action.dto';
import { UpdateUsersActionDto } from './dto/update-users-action.dto';

@Injectable()
export class UsersActionsRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(userId: number, dto: CreateUsersActionDto) {
    return await this.databaseService.client.userAction.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getById(userId: number, actionId: number) {
    return await this.databaseService.client.userAction.findUnique({
      where: {
        userId,
        id: actionId,
      },
    });
  }

  async findAll(userId: number) {
    console.log('userId :>> ', userId);
    return await this.databaseService.client.userAction.findMany({
      where: {
        userId,
      },
    });
  }

  async update(userId: number, actionId: number, data: UpdateUsersActionDto) {
    return await this.databaseService.client.userAction.update({
      where: {
        id: actionId,
        userId,
      },
      data,
    });
  }

  async remove(userId: number, actionId: number) {
    return await this.databaseService.client.userAction.delete({
      where: {
        userId,
        id: actionId,
      },
    });
  }
}
