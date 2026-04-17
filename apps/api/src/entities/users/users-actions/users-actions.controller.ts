import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUsersActionDto } from './dto/create-users-action.dto';
import { UpdateUsersActionDto } from './dto/update-users-action.dto';
import { UserExistsPipe } from './user-exists-pipe';
import { UsersActionsService } from './users-actions.service';

@Controller('users/:userId/actions')
export class UsersActionsController {
  constructor(
    private readonly usersActionsService: UsersActionsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Param('userId', UserExistsPipe) userId: string,
    @Body() createUsersActionDto: CreateUsersActionDto,
  ) {
    return await this.usersActionsService.create(
      Number(userId),
      createUsersActionDto,
    );
  }

  @Get()
  async findAll(@Param('userId', UserExistsPipe) userId: string) {
    return await this.usersActionsService.findAll(Number(userId));
  }

  @Get(':actionId')
  async findOne(
    @Param('userId', UserExistsPipe) userId: string,
    @Param('actionId') actionId: string,
  ) {
    return await this.usersActionsService.findOne(
      Number(userId),
      Number(actionId),
    );
  }

  @Patch(':actionId')
  async update(
    @Param('userId', UserExistsPipe) userId: string,
    @Param('actionId') actionId: string,
    @Body() updateUsersActionDto: UpdateUsersActionDto,
  ) {
    return await this.usersActionsService.update(
      Number(userId),
      Number(actionId),
      updateUsersActionDto,
    );
  }

  @Delete(':actionId')
  async remove(
    @Param('userId', UserExistsPipe) userId: string,
    @Param('actionId') actionId: string,
  ) {
    return await this.usersActionsService.remove(
      Number(userId),
      Number(actionId),
    );
  }
}
