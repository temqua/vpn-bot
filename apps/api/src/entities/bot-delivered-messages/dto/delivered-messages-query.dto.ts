import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByDeliveredMessagesField {
  CreateAt = 'createdAt',
}

export class DeliveredMessagesQueryDto extends BaseListDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsOptional()
  username?: string;
  @IsNumber()
  @IsOptional()
  userId?: number;
  @IsOptional()
  @IsEnum(OrderByDeliveredMessagesField)
  orderBy?: OrderByDeliveredMessagesField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
