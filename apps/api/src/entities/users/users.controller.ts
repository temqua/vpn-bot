import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private logger = new Logger('UsersController');

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
    try {
      return this.usersService.remove(+id);
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Get('/:id/servers')
  async getServers(@Param('id') userId: string) {
    return this.usersService.listUserServers(Number(userId));
  }

  @Get('/:id/servers/:serverId')
  async getUserServer(
    @Param('id') userId: string,
    @Param('serverId') serverId: string,
  ) {
    return this.usersService.listUserServerRecords(
      Number(userId),
      Number(serverId),
    );
  }
}
