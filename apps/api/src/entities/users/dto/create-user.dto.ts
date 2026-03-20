import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  firstName: string;

  telegramId: string | null;
  telegramLink: string | null;

  lastName: string | null;
  payerId: number | null;
}
