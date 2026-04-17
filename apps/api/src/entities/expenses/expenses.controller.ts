import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
  Req,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory } from '@prisma/client';
import type { Request } from 'express';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
  private logger = new Logger('ExpensesController');

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return await this.expensesService.create(createExpenseDto);
  }

  @Get()
  async findAll(@Query('category') category?: ExpenseCategory) {
    return await this.expensesService.list(category);
  }

  @Get('/sum')
  async sum(@Query('category') category?: ExpenseCategory) {
    return await this.expensesService.sum(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const ip = req.ip;
    const ips = req.ips;
    this.logger.log(ip);
    this.logger.log(ips);
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
