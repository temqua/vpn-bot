import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('username') username: string,
    @Query('telegram_id') telegramId: string,
    @Query('first_name') firstName: string,
  ) {
    return await this.usersService.findAll({
      username,
      telegramId,
      firstName,
    });
  }

  @Get('/unpaid')
  async findUnpaid() {
    return await this.usersService.findUnpaid();
  }

  @Get('/trial')
  async findTrial() {
    return await this.usersService.findTrial();
  }

  @Get('/:id/payments')
  async getPayments(@Param('id') id: string) {
    return await this.usersService.getUserPayments(id);
  }

  @Get('/:id/payments/last')
  async getLastPayment(@Param('id') id: string) {
    return await this.usersService.getLastUserPayment(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('/:id/servers')
  async getServers(@Param('id') id: string) {
    return this.usersService.getUserServers(+id);
  }
}
