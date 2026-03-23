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

  async list() {
    return await this.databaseService.client.expense.findMany();
  }

  async sum() {
    return await this.databaseService.client.expense.aggregate({
      _sum: {
        amount: true,
      },
    });
  }

  async sumNalogs() {
    return await this.databaseService.client.expense.aggregate({
      where: {
        category: ExpenseCategory.Nalog,
      },
      _sum: {
        amount: true,
      },
    });
  }
  async sumServers() {
    return await this.databaseService.client.expense.aggregate({
      where: {
        category: ExpenseCategory.Servers,
      },
      _sum: {
        amount: true,
      },
    });
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
