import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { UpdatePaymentDto } from './dto/update-payment.dto';

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
        planId: createPaymentDto.planId ?? null,
        parentPaymentId: createPaymentDto.parentPaymentId ?? null,
        currency: 'RUB',
      },
    });
  }

  async findAll() {
    return await this.databaseService.client.payment.findMany();
  }

  async findOne(id: string) {
    return await this.databaseService.client.payment.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return await this.databaseService.client.payment.update({
      data: {
        ...updatePaymentDto,
      },
      where: {
        id,
      },
    });
  }

  async getAllForSheet() {
    return await this.databaseService.client.payment.findMany({
      orderBy: {
        paymentDate: 'desc',
      },
      include: {
        user: {},
        plan: {},
      },
    });
  }

  // async getByDate(date: Date): Promise<Payment[]> {
  //   return await this.databaseService.client.payment.findMany({
  //     where: {
  //       paymentDate: {
  //         gte: startOfDay(date),
  //         lte: endOfDay(date),
  //       },
  //     },
  //   });
  // }

  async getByDateRange(from: Date, to: Date): Promise<Payment[]> {
    return await this.databaseService.client.payment.findMany({
      where: {
        paymentDate: {
          gte: startOfDay(from),
          lte: endOfDay(to),
        },
      },
    });
  }

  async sum() {
    const result = await this.databaseService.client.payment.aggregate({
      _sum: {
        amount: true,
      },
    });
    return result?._sum;
  }

  async remove(id: string) {
    return await this.databaseService.client.payment.delete({
      where: {
        id,
      },
    });
  }

  async getAllByUserId(userId: number): Promise<Payment[]> {
    return await this.databaseService.client.payment.findMany({
      where: {
        userId,
      },
    });
  }
}
