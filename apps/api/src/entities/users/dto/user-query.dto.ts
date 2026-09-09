import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByUserField {
  Username = 'username',
  FirstName = 'firstName',
}

export class UserQueryDto extends BaseListDto {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  username?: string;
  @IsString()
  @IsOptional()
  telegramId?: string;
  @IsString()
  @IsOptional()
  telegramLink?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
  @IsString()
  @IsOptional()
  price?: string;
  @IsOptional()
  @IsEnum(OrderByUserField)
  orderBy?: OrderByUserField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
  @IsString()
  @IsOptional()
  active?: string;
  @IsString()
  @IsOptional()
  free?: string;
  @IsString()
  @IsOptional()
  muted?: string;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  paymentsOrder?: OrderDirection;
  expiresAfterDays?: string;
  trial?: string;
  @IsString()
  @IsOptional()
  select?: string;
}
