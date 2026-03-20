import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from '../../database.service';
import { subMonths, subWeeks } from 'date-fns';
import { VPNProtocol } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.databaseService.client.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  async findAll() {
    return await this.databaseService.client.user.findMany();
  }

  async findOne(id: number) {
    return await this.databaseService.client.user.findFirst({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.databaseService.client.user.update({
      data: {
        ...updateUserDto,
      },
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    return await this.databaseService.client.user.delete({
      where: {
        id,
      },
    });
  }

  async getUnpaidUsers() {
    return await this.databaseService.client.user.findMany({
      where: {
        free: false,
        active: true,
        payments: {
          none: {
            expiresOn: {
              gt: new Date(),
            },
          },
        },
        createdAt: {
          lt: subWeeks(new Date(), 4),
        },
      },
      include: {
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });
  }

  async isTelegramUserUnpaid(telegramId: string) {
    return await this.databaseService.client.user.findFirst({
      where: {
        payments: {
          none: {
            expiresOn: {
              gt: new Date(),
            },
          },
        },
        createdAt: {
          lt: subMonths(new Date(), 1),
        },
        telegramId,
      },
    });
  }

  async isUserUnpaid(id: number) {
    return await this.databaseService.client.user.findFirst({
      where: {
        payments: {
          none: {
            expiresOn: {
              gt: new Date(),
            },
          },
        },
        createdAt: {
          lt: subMonths(new Date(), 1),
        },
        id,
        active: true,
        free: false,
      },
    });
  }

  async isUserPaid(id: number) {
    return await this.databaseService.client.user.findFirst({
      where: {
        id,
        active: true,
        OR: [
          {
            createdAt: {
              lt: subMonths(new Date(), 1),
            },
            payments: {
              some: {
                expiresOn: {
                  gt: new Date(),
                },
              },
            },
          },
          {
            createdAt: {
              gt: subMonths(new Date(), 1),
            },
          },
          {
            free: true,
          },
        ],
      },
    });
  }

  async getTrialUsers() {
    return await this.databaseService.client.user.findMany({
      where: {
        free: false,
        active: true,
        createdAt: {
          gt: subWeeks(new Date(), 3),
        },
      },
    });
  }

  async createUserServer(
    userId: number,
    serverId: number,
    protocol: VPNProtocol,
    username: string,
  ) {
    return await this.databaseService.client.serversUsers.create({
      data: {
        serverId,
        userId,
        protocol,
        username,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }

  async deleteUserServer(id: number) {
    return await this.databaseService.client.serversUsers.delete({
      where: {
        id,
      },
    });
  }

  async getUserServer(userId: number, serverId: number, protocol: VPNProtocol) {
    return await this.databaseService.client.serversUsers.findFirst({
      where: {
        userId,
        serverId,
        protocol,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }

  async getUserServerById(id: number) {
    return await this.databaseService.client.serversUsers.findFirst({
      where: {
        id,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }

  async listUserServers(userId: number) {
    return await this.databaseService.client.serversUsers.findMany({
      where: {
        userId,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }
}
