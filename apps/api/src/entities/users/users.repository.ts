import { Injectable } from '@nestjs/common';
import { Payment, Prisma, User, VPNProtocol } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { DatabaseService } from '../../database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { VPNUser } from './users.types';

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

  async findAll(dto?: UserQueryDto) {
    const where = this.buildWhere(dto);
    const select = dto?.select ? dto.select.split(',') : [];
    const baseParams = {
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
    if (dto?.select?.length) {
      const params = {
        ...baseParams,
        select: select.reduce((acc, curr) => {
          return {
            ...acc,
            [curr]: true,
          };
        }, {} as Prisma.UserSelect),
      };

      const [data, count] = await this.databaseService.client.$transaction([
        this.databaseService.client.user.findMany(params),
        this.databaseService.client.user.count(countParams),
      ]);
      return {
        data,
        count,
      };
    }
    const params = {
      ...baseParams,
      skip: dto?.skip != null ? Number(dto.skip) : undefined,
      take: dto?.take != null ? Number(dto.take) : undefined,
      omit: {
        password: true,
      },
      include: {
        payer: true,
        payments: {
          orderBy: {
            paymentDate:
              dto?.paymentsOrder ?? ('desc' as Prisma.SortOrder | undefined),
          },
        },
        dependants: true,
        referrer: true,
        referred: {
          where: {
            payments: {
              some: {},
            },
          },
        },
        referrerTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
        referredTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
      },
    };

    const [data, count] = await this.databaseService.client.$transaction([
      this.databaseService.client.user.findMany(params),
      this.databaseService.client.user.count(countParams),
    ]);
    return {
      data,
      count,
    };
  }

  private buildWhere(dto?: UserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    if (!dto) return where;

    if (dto.id) where.id = Number(dto.id);
    if (dto.price) where.price = Number(dto.price);
    if (dto.telegramId) where.telegramId = dto.telegramId;

    if (dto.username)
      where.username = { mode: 'insensitive', contains: dto.username };
    if (dto.firstName)
      where.firstName = { mode: 'insensitive', contains: dto.firstName };
    if (dto.lastName)
      where.lastName = { mode: 'insensitive', contains: dto.lastName };
    if (dto.telegramLink)
      where.telegramLink = { mode: 'insensitive', contains: dto.telegramLink };
    if (dto.active !== undefined) where.active = dto.active === 'true';
    if (dto.free !== undefined) where.free = dto.free === 'true';
    if (dto.muted !== undefined) where.muted = dto.muted === 'true';

    if (dto.trial !== undefined) {
      where.createdAt =
        dto.trial === 'true'
          ? { gt: subDays(new Date(), 3) }
          : { lt: subDays(new Date(), 3) };
    }

    if (dto.expiresAfterDays !== undefined) {
      where.payments = {
        none: {
          expiresOn: { gt: addDays(new Date(), Number(dto.expiresAfterDays)) },
        },
      };
    }

    return where;
  }

  async findAllActive() {
    return await this.databaseService.client.user.findMany({
      omit: {
        password: true,
      },
      where: {
        active: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.databaseService.client.user.findFirst({
      where: {
        id,
      },
      include: {
        payer: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
        dependants: true,
        referrer: true,
        referred: {
          where: {
            payments: {
              some: {},
            },
            referredTransactions: {
              none: {},
            },
          },
        },
        messageDeliveries: true,
        referrerTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
        referredTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
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
      include: {
        payer: true,
        payments: true,
        dependants: true,
        referrer: true,
        referred: {
          where: {
            payments: {
              some: {},
            },
            referredTransactions: {
              none: {},
            },
          },
        },
        messageDeliveries: true,
        referrerTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
        referredTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.databaseService.client.userAction.deleteMany({
      where: {
        userId: id,
      },
    });
    await this.databaseService.client.messageDelivery.deleteMany({
      where: {
        userId: id,
      },
    });
    return await this.databaseService.client.user.delete({
      where: {
        id,
      },
    });
  }

  async findUniqueByUsername(username: string): Promise<VPNUser | null> {
    return await this.databaseService.client.user.findUnique({
      where: {
        username,
      },
      include: {
        payer: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
        dependants: true,
        referrer: true,
        referred: {
          where: {
            payments: {
              some: {},
            },
            referredTransactions: {
              none: {},
            },
          },
        },
        messageDeliveries: true,
        referrerTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
        referredTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
      },
    });
  }

  async findUniqueByTelegram(telegramId: string): Promise<VPNUser | null> {
    return await this.databaseService.client.user.findUnique({
      where: {
        telegramId,
      },
      include: {
        payer: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
        dependants: true,
        referrer: true,
        referred: {
          where: {
            payments: {
              some: {},
            },
            referredTransactions: {
              none: {},
            },
          },
        },
        messageDeliveries: true,
        referrerTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
        referredTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
      },
    });
  }

  async getByUsername(username: string): Promise<VPNUser | null> {
    return await this.databaseService.client.user.findUnique({
      where: {
        username,
      },
      include: {
        payer: true,
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
        dependants: true,
        referrer: true,
        referred: {
          where: {
            payments: {
              some: {},
            },
            referredTransactions: {
              none: {},
            },
          },
        },
        messageDeliveries: true,
        referrerTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
        referredTransactions: {
          include: {
            referrer: true,
            referred: true,
            payment: true,
          },
        },
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
          lt: subDays(new Date(), 3),
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

  async payersList(userId: number): Promise<User[]> {
    return await this.databaseService.client.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      orderBy: {
        firstName: 'asc',
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
          lt: subDays(new Date(), 3),
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
          lt: subDays(new Date(), 3),
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
              lt: subDays(new Date(), 3),
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
              gt: subDays(new Date(), 3),
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
          gt: subDays(new Date(), 3),
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
    const where = {
      userId,
    };
    const params = {
      where,
      include: {
        server: {},
        user: {},
      },
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

  async listUserServerRecords(userId: number, serverId: number) {
    return await this.databaseService.client.serversUsers.findMany({
      where: {
        userId,
        serverId,
      },
      include: {
        server: {},
        user: {},
      },
    });
  }

  async clearAll() {
    return await this.databaseService.client.user.updateMany({
      data: {
        rwId: null,
        rwLink: null,
        rwUsername: null,
        rwUUID: null,
      },
    });
  }

  async getLastUserPayment(userId: number): Promise<Payment | null> {
    return await this.databaseService.client.payment.findFirst({
      where: {
        userId,
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return await this.databaseService.client.payment.findMany({
      where: {
        userId,
      },
    });
  }

  async getSubscription(userId: number): Promise<string | null> {
    const user = await this.databaseService.client.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user?.rwLink ?? null;
  }

  async createSubscription(
    userId: number,
    rwLink: string | null,
    rwUsername: string | null,
    rwUUID: string | null,
    rwId: number | null,
  ) {
    return await this.databaseService.client.user.update({
      data: {
        rwId,
        rwLink,
        rwUsername,
        rwUUID,
      },
      where: {
        id: userId,
      },
    });
  }

  async deleteSubscription(userId: number) {
    return await this.databaseService.client.user.update({
      data: {
        rwId: null,
        rwLink: null,
        rwUsername: null,
        rwUUID: null,
      },
      where: {
        id: userId,
      },
    });
  }
}
