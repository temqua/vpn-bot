import { ExpenseCategory } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByExpenseField {
  Amount = 'amount',
  PaymentDate = 'paymentDate',
}

export class ExpenseListDto extends BaseListDto {
  @IsString()
  id?: string;

  @IsString()
  from?: string;

  @IsString()
  to?: string;

  @IsString()
  category?: ExpenseCategory;

  @IsNumber()
  amount?: number;
  @IsOptional()
  @IsEnum(OrderByExpenseField)
  orderBy?: OrderByExpenseField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
