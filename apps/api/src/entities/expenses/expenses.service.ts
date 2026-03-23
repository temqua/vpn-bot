import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseCategory } from '@prisma/client';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesRepository } from './expenses.repository';

@Injectable()
export class ExpensesService {
  constructor(private repository: ExpensesRepository) {}

  async create(createExpenseDto: CreateExpenseDto) {
    return await this.repository.create(
      createExpenseDto.category,
      createExpenseDto.amount,
      createExpenseDto.description,
    );
  }

  async findOne(id: string) {
    const expense = await this.repository.findOne(id);
    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }
    return expense;
  }

  async list(category?: ExpenseCategory) {
    return await this.repository.list(category);
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return await this.repository.update(id, updateExpenseDto);
  }

  async remove(id: string) {
    return this.repository.delete(id);
  }

  async sum(category?: ExpenseCategory) {
    if (category === ExpenseCategory.Nalog) {
      return await this.repository.sumNalogs();
    }
    if (category === ExpenseCategory.Servers) {
      return await this.repository.sumServers();
    }
    return await this.repository.sum();
  }
}
