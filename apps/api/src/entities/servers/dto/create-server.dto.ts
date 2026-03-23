import { IsString } from 'class-validator';

export class CreateServerDto {
  @IsString()
  url: string;

  @IsString()
  name: string;
}
