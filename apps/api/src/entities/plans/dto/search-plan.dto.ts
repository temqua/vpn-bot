import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByPlanField {
  Amount = 'amount',
  Price = 'price',
  Id = 'id',
  ExpiresOn = 'expiresOn',
}

export class SearchPlanDto extends BaseListDto {
  @IsString()
  name?: string;
  @IsString()
  count?: string;
  @IsString()
  minCount?: string;
  @IsString()
  maxCount?: string;
  @IsString()
  price?: string;
  @IsString()
  months?: string;
  @IsString()
  amount?: string;
  @IsString()
  id?: string;
  @IsOptional()
  @IsEnum(OrderByPlanField)
  orderBy?: OrderByPlanField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
  @IsString()
  @IsOptional()
  select?: string;
}
