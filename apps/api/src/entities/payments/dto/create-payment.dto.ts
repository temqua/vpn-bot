import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  monthsCount: number;

  @IsString()
  expiresOn: string;

  @IsNumber()
  planId?: number | null;

  @IsString()
  parentPaymentId?: string | null;
}
