import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    return await this.databaseService.client.payment.create({
      data: {
        userId: createPaymentDto.userId,
        amount: createPaymentDto.amount,
        monthsCount: createPaymentDto.monthsCount,
        expiresOn: createPaymentDto.expiresOn,
        planId: createPaymentDto.plan?.id ?? null,
        parentPaymentId: createPaymentDto.parentPaymentId ?? null,
        currency: 'RUB',
      },
    });
  }

  async findAll() {
    return await this.databaseService.client.payment.findMany();
  }

  async findOne(id: string) {
    return await this.databaseService.client.payment.findFirst({
      where: {
        id,
      },
    });
  }

  // async update(id: string, updatePaymentDto: UpdatePaymentDto) {
  //   return await this.databaseService.client.payment.update({
  //     data: {

  //       ...updatePaymentDto,
  //     },
  //     where: {
  //       id,
  //     },
  //   });
  // }

  async remove(id: string) {
    return await this.databaseService.client.payment.delete({
      where: {
        id,
      },
    });
  }
}
