import { Injectable } from '@nestjs/common';
import { CreateUsersActionDto } from './dto/create-users-action.dto';
import { UpdateUsersActionDto } from './dto/update-users-action.dto';
import { UsersActionsRepository } from './users-actions.repository';

@Injectable()
export class UsersActionsService {
  constructor(private repository: UsersActionsRepository) {}
  async create(userId: number, createUsersActionDto: CreateUsersActionDto) {
    return await this.repository.create(userId, createUsersActionDto);
  }

  async findAll(userId: number) {
    return await this.repository.findAll(userId);
  }

  async findOne(userId: number, actionId: number) {
    return await this.repository.getById(userId, actionId);
  }

  async update(userId: number, actionId: number, dto: UpdateUsersActionDto) {
    return await this.repository.update(userId, actionId, dto);
  }

  async remove(userId: number, actionId: number) {
    return await this.repository.remove(userId, actionId);
  }
}
