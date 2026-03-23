import { Injectable } from '@nestjs/common';
import { VpnServer } from '@prisma/client';
import { DatabaseService } from '../../database.service';
import { UpdateServerDto } from './dto/update-server.dto';

@Injectable()
export class ServersRepository {
  constructor(private databaseService: DatabaseService) {}

  async getAll(): Promise<VpnServer[]> {
    return await this.databaseService.client.vpnServer.findMany();
  }

  async create(name: string, url: string) {
    return await this.databaseService.client.vpnServer.create({
      data: {
        name,
        url,
      },
    });
  }

  async delete(id: number) {
    await this.databaseService.client.serversUsers.deleteMany({
      where: {
        serverId: id,
      },
    });
    return await this.databaseService.client.vpnServer.delete({
      where: {
        id,
      },
    });
  }

  async getUsers(id: number) {
    return await this.databaseService.client.serversUsers.findMany({
      where: {
        serverId: id,
      },
      include: {
        user: {},
      },
    });
  }

  async getById(id: number): Promise<VpnServer | null> {
    return await this.databaseService.client.vpnServer.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: UpdateServerDto) {
    return await this.databaseService.client.vpnServer.update({
      where: {
        id,
      },
      data,
    });
  }
}
