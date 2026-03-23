import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  async create(@Body() createServerDto: CreateServerDto) {
    return await this.serversService.create(createServerDto);
  }

  @Get()
  async findAll() {
    return await this.serversService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.serversService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServerDto: UpdateServerDto,
  ) {
    return await this.serversService.update(+id, updateServerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.serversService.remove(+id);
  }

  @Get(':id/users')
  async getUsers(@Param('id') id: string) {
    return await this.serversService.getUsers(+id);
  }
}
