import { IsString } from 'class-validator';

export class CreateDeliveredMessageDto {
  @IsString()
  message: string;
}
