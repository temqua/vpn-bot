import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByUserServerField {
  AssignedAt = 'assignedAt',
  Protocol = 'protocol',
}

export class UserServerQueryDto extends BaseListDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsOptional()
  username?: string;
  @IsString()
  @IsOptional()
  url?: string;
  @IsString()
  @IsOptional()
  protocol?: string;
  @IsOptional()
  @IsEnum(OrderByUserServerField)
  orderBy?: OrderByUserServerField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
