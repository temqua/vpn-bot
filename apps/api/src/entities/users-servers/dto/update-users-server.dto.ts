import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersServerDto } from './create-users-server.dto';

export class UpdateUsersServerDto extends PartialType(CreateUsersServerDto) {}
