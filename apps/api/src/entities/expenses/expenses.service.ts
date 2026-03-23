import { Injectable } from '@nestjs/common';
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
    return await this.repository.findOne(id);
  }

  async list() {
    return await this.repository.list();
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return await this.repository.update(id, updateExpenseDto);
  }

  async remove(id: string) {
    return this.repository.delete(id);
  }
}
