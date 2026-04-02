import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersServersService } from './users-servers.service';
import { CreateUsersServerDto } from './dto/create-users-server.dto';
import { UpdateUsersServerDto } from './dto/update-users-server.dto';

@Controller('users-servers')
export class UsersServersController {
  constructor(private readonly usersServersService: UsersServersService) {}

  @Post()
  create(@Body() createUsersServerDto: CreateUsersServerDto) {
    return this.usersServersService.create(createUsersServerDto);
  }

  @Get()
  findAll() {
    return this.usersServersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersServersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersServersService.remove(+id);
  }
}
