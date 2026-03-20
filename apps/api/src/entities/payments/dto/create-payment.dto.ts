import { Plan } from '@prisma/client';
import { IsDate, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  monthsCount: number;

  @IsDate()
  expiresOn: Date;

  plan?: Plan | null;

  parentPaymentId?: string | null;
}
