import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseListDto } from '../../../dto/base-dto';
import { OrderDirection } from '../../../enums';

export enum OrderByServerField {
  ID = 'id',
  Name = 'name',
}

export enum OrderByServerUserField {
  Protocol = 'protocol',
  Username = 'username',
  ID = 'id',
}

export class ServerQueryDto extends BaseListDto {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsOptional()
  @IsEnum(OrderByServerField)
  orderBy?: OrderByServerField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}

export class ServerUserQueryDto extends BaseListDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsOptional()
  username?: string;
  @IsString()
  @IsOptional()
  protocol?: string;
  @IsOptional()
  @IsEnum(OrderByServerUserField)
  orderBy?: OrderByServerUserField;
  @IsString()
  @IsOptional()
  @IsEnum(OrderDirection)
  orderDirection?: OrderDirection;
}
