import { Injectable } from '@nestjs/common';
import type { Plan, Prisma } from '@prisma/client';
import { DatabaseService } from '../../database.service';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SearchPlanDto } from './dto/search-plan.dto';

@Injectable()
export class PlansRepository {
  constructor(private databaseService: DatabaseService) {}
  async findPlan(dto?: SearchPlanDto) {
    const where: Prisma.PlanWhereInput = this.buildWhere(dto);
    const select = dto?.select ? dto.select.split(',') : [];
    const baseParams = {
      where,
      orderBy:
        dto?.orderBy && dto?.orderDirection
          ? {
              [dto.orderBy]: dto.orderDirection,
            }
          : undefined,
    };
    const countParams = {
      where,
    };
    if (dto?.select?.length) {
      const params = {
        ...baseParams,
        select: select.reduce((acc, curr) => {
          return {
            ...acc,
            [curr]: true,
          };
        }, {} as Prisma.PlanSelect),
      };

      const [data, count] = await this.databaseService.client.$transaction([
        this.databaseService.client.plan.findMany(params),
        this.databaseService.client.plan.count(countParams),
      ]);
      return {
        data,
        count,
      };
    }
    const params = {
      skip: dto?.skip ? Number(dto.skip) : undefined,
      take: dto?.take ? Number(dto.take) : undefined,
      ...baseParams,
    };

    const [data, count] = await this.databaseService.client.$transaction([
      this.databaseService.client.plan.findMany(params),
      this.databaseService.client.plan.count(countParams),
    ]);
    return {
      data,
      count,
    };
  }

  buildWhere(dto?: SearchPlanDto) {
    const where: Prisma.PlanWhereInput = {};
    if (!dto) return where;
    if (dto?.id) {
      where.id = Number(dto.id);
    }
    if (dto?.name) {
      where.name = {
        contains: dto.name,
      };
    }
    if (dto?.amount) {
      where.amount = Number(dto.amount);
    }
    if (dto?.months) {
      where.months = Number(dto.months);
    }
    if (dto?.price) {
      where.price = Number(dto.price);
    }
    if (dto?.minCount) {
      where.minCount = Number(dto.minCount);
    }
    if (dto?.maxCount) {
      where.maxCount = Number(dto.maxCount);
    }
    if (dto?.count) {
      where.minCount = {
        lte: Number(dto.count),
      };
      where.maxCount = {
        gte: Number(dto.count),
      };
    }
    return where;
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
