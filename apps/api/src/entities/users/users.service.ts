import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import env from '../../env';
import { exportToSheet, generateDownloadLink, getQRLink } from '../../utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { RemnawaveService } from './rw.service';
import { UsersRepository } from './users.repository';
import { UserExportRow } from './users.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly rwService: RemnawaveService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const result = await this.repository.create(createUserDto);
      return result;
    } catch (err) {
      if (err?.meta?.driverAdapterError?.cause) {
        throw new InternalServerErrorException(
          err?.meta?.driverAdapterError?.cause?.originalMessage,
        );
      }
      throw new InternalServerErrorException(err);
    }
  }

  async findAll(dto: UserQueryDto) {
    return await this.repository.findAll(dto);
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async findOneByUsername(username: string) {
    return await this.repository.findUniqueByUsername(username);
  }

  async findOneByTelegram(telegramId: string) {
    return await this.repository.findUniqueByTelegram(telegramId);
  }

  async findUnpaid() {
    return await this.repository.getUnpaidUsers();
  }

  async findTrial() {
    return await this.repository.getTrialUsers();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const dto = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      dto.password = await bcrypt.hash(updateUserDto.password, env.SALT_ROUNDS);
    }
    try {
      return await this.repository.update(id, dto);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async remove(id: number) {
    const user = await this.repository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // if (user.rwUUID) {
    //   await this.rwService.deleteUser(user.rwUUID);
    // }
    try {
      return await this.repository.remove(id);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getUserPayments(id: string) {
    return await this.repository.getUserPayments(Number(id));
  }

  async getLastUserPayment(id: string) {
    return await this.repository.getLastUserPayment(Number(id));
  }

  async listUserServers(id: number) {
    const result = await this.repository.listUserServers(id);
    result.data = result.data.map((record) => ({
      ...record,
      downloadLink: generateDownloadLink(record),
      qrLink: getQRLink(record),
    }));
    return result;
  }

  async getUserServerRecordById(id: number) {
    return await this.repository.getUserServerById(id);
  }

  async listUserServerRecords(userId: number, serverId: number) {
    return await this.repository.listUserServerRecords(userId, serverId);
  }

  async createForAll() {
    const users = await this.repository.findAllActive();
    for (const user of users) {
      await this.createSubscription(user.id);
    }
  }

  async createSubscription(userId: number) {
    const user = await this.repository.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const expiresOn = user?.payments.length
      ? user?.payments[0].expiresOn
      : undefined;
    const result = await this.rwService.createUser(
      `${user?.username}_${user?.id}`,
      expiresOn,
    );
    const resp = result?.response;
    const addToSquad = await this.rwService.updateUser({
      uuid: resp.uuid,
      activeInternalSquads: ['df0af3dd-572e-43e5-a8a0-e84103392eca'],
    });
    return await this.repository.createSubscription(
      userId,
      resp?.subscriptionUrl ?? null,
      resp?.username ?? null,
      resp?.uuid ?? null,
      resp?.id ?? null,
    );
  }

  async getSubscription(userId: number) {
    const sub = await this.repository.getSubscription(userId);
    if (!sub) {
      throw new NotFoundException(
        `Subscription for user with id ${userId} not found`,
      );
    }
    return sub;
  }

  async deleteSubscription(userId: number) {
    const user = await this.repository.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    if (!user.rwUUID) {
      throw new NotFoundException(
        `User with id ${userId} has no remnawave UUID`,
      );
    }
    const result = await this.rwService.deleteUser(user.rwUUID);
    if (!result) {
      throw new InternalServerErrorException(
        `Unexpected error while deleting user ${user?.username}_${user?.id}`,
      );
    }
    return await this.repository.deleteSubscription(userId);
  }

  async clearAll() {
    return await this.repository.clearAll();
  }

  async export() {
    const {
      data,
    }: {
      data: UserExportRow[];
      count: number;
    } = await this.repository.findAll({
      select: [
        'firstName',
        'lastName',
        'username',
        'telegramId',
        'telegramLink',
        'id',
        'price',
        'devices',
        'createdAt',
        'free',
        'active',
        'rwLink',
        'rwId',
      ].join(','),
    });
    const preparedData = data.map((row) => {
      return [
        row.firstName ?? '',
        row.lastName ?? '',
        row.username ?? '',
        row.telegramId ?? '',
        row.telegramLink ?? '',
        row.id ? row.id.toString() : '',
        row.price ? row.price.toString() : '',
        row.devices?.length ? row.devices.join(', ') : '',
        row.createdAt
          ? new Date(row.createdAt).toLocaleString('ru-RU', { timeZone: 'UTC' })
          : '',
        row.free ? true : false,
        row.active ? true : false,
        row.rwLink ? row.rwLink.toString() : '',
        row.rwId ? row.rwId.toString() : '',
      ];
    });
    return await exportToSheet(env.SHEET_ID, 'Users!A2', preparedData);
  }
}
