import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByIncomingMessageField {
  ID = 'id',
  Username = 'username',
  FirstName = 'firstName',
  LastName = 'lastName',
  CreatedAt = 'createdAt',
}

export class IncomingMessagesQueryDto extends BaseListDto {
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
  @IsEnum(OrderByIncomingMessageField)
  orderBy?: OrderByIncomingMessageField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
