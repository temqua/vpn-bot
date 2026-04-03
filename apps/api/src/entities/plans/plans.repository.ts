import { Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';
import { DatabaseService } from '../../database.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansRepository {
  constructor(private databaseService: DatabaseService) {}
  async findPlan(amount: number, price: number, count: number) {
    return await this.databaseService.client.plan.findMany({
      where: {
        amount,
        price,
        minCount: {
          lte: count,
        },
        maxCount: {
          gte: count,
        },
      },
    });
  }

  async findByPriceAndCount(price: number, count: number) {
    return await this.databaseService.client.plan.findMany({
      where: {
        price,
        minCount: {
          lte: count,
        },
        maxCount: {
          gte: count,
        },
      },
      orderBy: [
        {
          months: 'asc',
        },
      ],
    });
  }

  async findByPriceAndAmount(price: number, amount: number) {
    return await this.databaseService.client.plan.findMany({
      where: {
        price,
        amount,
      },
    });
  }

  async findByCount(count: number) {
    return await this.databaseService.client.plan.findMany({
      where: {
        minCount: {
          lte: count,
        },
        maxCount: {
          gte: count,
        },
      },
      orderBy: [
        {
          months: 'asc',
        },
      ],
    });
  }

  async findByAmount(amount: number) {
    return await this.databaseService.client.plan.findMany({
      where: {
        amount,
      },
      orderBy: [
        {
          months: 'asc',
        },
      ],
    });
  }

  async getAll(): Promise<Plan[]> {
    return await this.databaseService.client.plan.findMany({
      orderBy: [
        {
          price: 'desc',
        },
        {
          maxCount: 'asc',
        },
        {
          months: 'asc',
        },
      ],
    });
  }

  async getById(id: number): Promise<Plan | null> {
    return await this.databaseService.client.plan.findUnique({
      where: {
        id,
      },
    });
  }

  async getByPrice(price: number) {
    return await this.databaseService.client.plan.findMany({
      where: {
        price,
      },
      orderBy: [
        {
          maxCount: 'asc',
        },
        {
          months: 'asc',
        },
      ],
    });
  }

  async create(
    name: string,
    amount: number,
    price: number,
    minCount: number,
    maxCount: number,
    monthsCount: number,
  ) {
    return await this.databaseService.client.plan.create({
      data: {
        amount,
        price,
        months: monthsCount,
        name,
        minCount,
        maxCount,
      },
    });
  }

  async update(id: number, dto: UpdatePlanDto) {
    return await this.databaseService.client.plan.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: number) {
    return await this.databaseService.client.plan.delete({
      where: {
        id,
      },
    });
  }
}
