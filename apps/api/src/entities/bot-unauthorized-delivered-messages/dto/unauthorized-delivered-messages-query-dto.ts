import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByUnauthorizedMessageField {
  ID = 'id',
  TelegramId = 'telegramId',
  CreatedAt = 'createdAt',
}

export class UnauthorizedUsersDeliveredMessagesQueryDto extends BaseListDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsOptional()
  telegramId?: string;
  @IsOptional()
  @IsEnum(OrderByUnauthorizedMessageField)
  orderBy?: OrderByUnauthorizedMessageField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
