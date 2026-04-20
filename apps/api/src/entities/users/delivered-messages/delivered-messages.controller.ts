import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserExistsPipe } from '../user-exists-pipe';
import { DeliveredMessagesService } from './delivered-messages.service';
import { CreateDeliveredMessageDto } from './dto/create-delivered-message.dto';
import { UpdateDeliveredMessageDto } from './dto/update-delivered-message.dto';

@Controller('users/:userId/delivered-messages')
export class DeliveredMessagesController {
  constructor(
    private readonly deliveredMessagesService: DeliveredMessagesService,
  ) {}

  @Post()
  async create(
    @Param('userId', UserExistsPipe) userId: string,

    @Body() createDeliveredMessageDto: CreateDeliveredMessageDto,
  ) {
    return await this.deliveredMessagesService.create(
      Number(userId),
      createDeliveredMessageDto,
    );
  }

  @Get()
  async findAll(@Param('userId', UserExistsPipe) userId: string) {
    return await this.deliveredMessagesService.findAll(Number(userId));
  }

  @Get(':id')
  async findOne(
    @Param('userId', UserExistsPipe) userId: string,
    @Param('id') id: string,
  ) {
    return await this.deliveredMessagesService.findOne(
      Number(userId),
      Number(id),
    );
  }

  @Patch(':id')
  async update(
    @Param('userId', UserExistsPipe) userId: string,
    @Param('id') id: string,
    @Body() updateDeliveredMessageDto: UpdateDeliveredMessageDto,
  ) {
    return this.deliveredMessagesService.update(
      Number(userId),
      Number(id),
      updateDeliveredMessageDto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('userId', UserExistsPipe) userId: string,
    @Param('id') id: string,
  ) {
    return this.deliveredMessagesService.remove(Number(userId), Number(id));
  }
}
