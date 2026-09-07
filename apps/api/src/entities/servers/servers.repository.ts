import { Injectable } from '@nestjs/common';
import { Prisma, VPNProtocol, VpnServer } from '@prisma/client';
import { DatabaseService } from '../../database.service';
import { UpdateServerDto } from './dto/update-server.dto';
import { ServerQueryDto, ServerUserQueryDto } from './dto/server-query.dto';

@Injectable()
export class ServersRepository {
  constructor(private databaseService: DatabaseService) {}

  async getAll(dto: ServerQueryDto) {
    const where: Prisma.VpnServerWhereInput = {};
    if (dto?.id) {
      where.id = Number(dto?.id);
    }
    if (dto?.name) {
      where.name = {
        mode: 'insensitive',
        contains: dto?.name,
      };
    }
    if (dto?.url) {
      where.name = {
        mode: 'insensitive',
        contains: dto?.url,
      };
    }

    const params = {
      skip: dto?.skip ? Number(dto.skip) : undefined,
      take: dto?.take ? Number(dto.take) : undefined,
      where,
      orderBy:
        dto?.orderBy && dto?.orderDirection
          ? {
              [dto.orderBy]: dto.orderDirection,
            }
          : undefined,
    };
    const countParams = {
      where,
    };
    const [data, count] = await this.databaseService.client.$transaction([
      this.databaseService.client.vpnServer.findMany(params),
      this.databaseService.client.vpnServer.count(countParams),
    ]);
    return {
      data,
      count,
    };
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

  async getUsers(id: number, dto?: ServerUserQueryDto) {
    const where: Prisma.ServersUsersWhereInput = {
      serverId: id,
    };
    if (dto?.id) {
      where.id = Number(dto.id);
    }
    if (dto?.userId) {
      where.userId = Number(dto.userId);
    }
    if (dto?.protocol) {
      where.protocol = dto.protocol as VPNProtocol;
    }
    if (dto?.username) {
      where.username = {
        mode: 'insensitive',
        contains: dto?.username,
      };
    }
    const params = {
      where,
      include: {
        user: {},
        server: {},
      },
      orderBy:
        dto?.orderBy && dto?.orderDirection
          ? {
              [dto.orderBy]: dto.orderDirection,
            }
          : undefined,
    };
    const countParams = {
      where,
    };
    const [data, count] = await this.databaseService.client.$transaction([
      this.databaseService.client.serversUsers.findMany(params),
      this.databaseService.client.serversUsers.count(countParams),
    ]);
    return {
      data,
      count,
    };
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
