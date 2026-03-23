import { ExpenseCategory } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  category: ExpenseCategory;

  @IsNumber()
  amount: number;

  @IsString()
  description: string = '';
}
