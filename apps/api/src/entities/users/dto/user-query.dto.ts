import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByUserField {
  Username = 'username',
  FirstName = 'firstName',
}

export class UserQueryDto extends BaseListDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsOptional()
  username?: string;
  @IsString()
  @IsOptional()
  telegramId?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
  @IsOptional()
  @IsEnum(OrderByUserField)
  orderBy?: OrderByUserField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
  active?: string;
  free?: string;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  paymentsOrder?: OrderDirection;
  expiresAfterDays?: string;
  trial?: string;
  select?: string;
}
