import { Injectable } from '@nestjs/common';
import { CreateDeliveredMessageDto } from './dto/create-delivered-message.dto';
import { UpdateDeliveredMessageDto } from './dto/update-delivered-message.dto';
import { DeliveredMessagesRepository } from './delivered-messages.repository';

@Injectable()
export class DeliveredMessagesService {
  constructor(private repository: DeliveredMessagesRepository) {}

  async create(
    userId: number,
    createDeliveredMessageDto: CreateDeliveredMessageDto,
  ) {
    return await this.repository.create(userId, createDeliveredMessageDto);
  }

  async findAll(userId: number) {
    return await this.repository.findAll(userId);
  }

  async findOne(userId: number, id: number) {
    return await this.repository.getById(userId, id);
  }

  async update(userId: number, id: number, dto: UpdateDeliveredMessageDto) {
    return await this.repository.update(userId, id, dto);
  }

  async remove(userId: number, id: number) {
    return await this.repository.remove(userId, id);
  }
}
