import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExpenseCategory } from '@prisma/client';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseListDto } from './dto/list-dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return await this.expensesService.create(createExpenseDto);
  }

  @Get()
  async findAll(@Query() dto?: ExpenseListDto) {
    return await this.expensesService.list(dto);
  }

  @Get('/sum')
  async sum(@Query('category') category?: ExpenseCategory) {
    return await this.expensesService.sum(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.expensesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.expensesService.remove(id);
  }

  @Post('/export')
  async export() {
    return await this.expensesService.export();
  }
}
