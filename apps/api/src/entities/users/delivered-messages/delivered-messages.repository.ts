import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database.service';
import { CreateDeliveredMessageDto } from './dto/create-delivered-message.dto';
import { UpdateDeliveredMessageDto } from './dto/update-delivered-message.dto';

@Injectable()
export class DeliveredMessagesRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(userId: number, dto: CreateDeliveredMessageDto) {
    return await this.databaseService.client.messageDelivery.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getById(userId: number, deliveryId: number) {
    return await this.databaseService.client.messageDelivery.findUnique({
      where: {
        userId,
        id: deliveryId,
      },
    });
  }

  async findAll(userId: number) {
    return await this.databaseService.client.messageDelivery.findMany({
      where: {
        userId,
      },
    });
  }

  async update(
    userId: number,
    deliveryId: number,
    data: UpdateDeliveredMessageDto,
  ) {
    return await this.databaseService.client.messageDelivery.update({
      where: {
        id: deliveryId,
        userId,
      },
      data,
    });
  }

  async remove(userId: number, deliveryId: number) {
    return await this.databaseService.client.messageDelivery.delete({
      where: {
        userId,
        id: deliveryId,
      },
    });
  }
}
