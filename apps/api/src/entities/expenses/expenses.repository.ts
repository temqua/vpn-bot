import { ExpenseCategory } from '@prisma/client';
import { DatabaseService } from '../../database.service';
import { Injectable } from '@nestjs/common';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(
    category: ExpenseCategory,
    amount: number,
    description: string = '',
  ) {
    return await this.databaseService.client.expense.create({
      data: {
        category,
        amount,
        description,
      },
    });
  }

  async findOne(id: string) {
    return await this.databaseService.client.expense.findUnique({
      where: {
        id,
      },
    });
  }

  async list(category?: ExpenseCategory) {
    const params = category
      ? {
          where: {
            category,
          },
        }
      : undefined;
    return await this.databaseService.client.expense.findMany(params);
  }

  async sum() {
    const result = await this.databaseService.client.expense.aggregate({
      _sum: {
        amount: true,
      },
    });
    return result?._sum;
  }

  async sumNalogs() {
    const result = await this.databaseService.client.expense.aggregate({
      where: {
        category: ExpenseCategory.Nalog,
      },
      _sum: {
        amount: true,
      },
    });
    return result?._sum;
  }
  async sumServers() {
    const result = await this.databaseService.client.expense.aggregate({
      where: {
        category: ExpenseCategory.Servers,
      },
      _sum: {
        amount: true,
      },
    });
    return result?._sum;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return await this.databaseService.client.expense.update({
      data: {
        ...updateExpenseDto,
      },
      where: {
        id,
      },
    });
  }

  async delete(id: string) {
    return await this.databaseService.client.expense.delete({
      where: {
        id,
      },
    });
  }
}
