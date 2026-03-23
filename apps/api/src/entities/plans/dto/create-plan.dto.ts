import { IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  price: number;

  @IsNumber()
  minCount: number;

  @IsNumber()
  maxCount: number;

  @IsNumber()
  monthsCount: number;
}
