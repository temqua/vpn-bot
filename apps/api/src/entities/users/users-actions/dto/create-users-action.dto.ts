import { IsString } from 'class-validator';

export class CreateUsersActionDto {
  @IsString()
  command: string;

  @IsString()
  action?: string;

  @IsString()
  message?: string;
}
