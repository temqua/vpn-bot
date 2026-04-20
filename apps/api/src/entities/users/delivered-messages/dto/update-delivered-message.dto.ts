import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveredMessageDto } from './create-delivered-message.dto';

export class UpdateDeliveredMessageDto extends PartialType(
  CreateDeliveredMessageDto,
) {}
