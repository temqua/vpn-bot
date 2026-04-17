import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersActionDto } from './create-users-action.dto';

export class UpdateUsersActionDto extends PartialType(CreateUsersActionDto) {}
