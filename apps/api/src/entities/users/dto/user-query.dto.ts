import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderDirection } from '../../../enums';

export enum OrderByUserField {
  Username = 'username',
  FirstName = 'firstName',
}

export class UserQueryDto {
  @IsString()
  @IsOptional()
  username?: string;
  @IsString()
  @IsOptional()
  telegramId?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsOptional()
  @IsEnum(OrderByUserField)
  orderBy?: OrderByUserField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
