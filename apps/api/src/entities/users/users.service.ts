import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import env from '../../env';
import { exportToSheet } from '../../utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { RemnawaveService } from './rw.service';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private readonly rwService: RemnawaveService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.repository.create(createUserDto);
  }

  async findAll(dto: UserQueryDto) {
    if (dto.username) {
      return await this.repository.findByUsername(dto.username);
    }
    if (dto.firstName) {
      return await this.repository.findByFirstName(dto.firstName);
    }
    if (dto.telegramId) {
      return await this.repository.getByTelegramId(dto.telegramId);
    }
    if (dto.orderBy) {
      return await this.repository.findAll({
        by: dto.orderBy,
        direction: dto.orderDirection ?? 'asc',
      });
    }
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async findUnpaid() {
    return await this.repository.getUnpaidUsers();
  }

  async findTrial() {
    return await this.repository.getTrialUsers();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.repository.update(id, updateUserDto);
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
    return await this.repository.listUserServers(id);
  }

  async getUserServerRecordById(id: number) {
    return await this.repository.getUserServerById(id);
  }

  async listUserServerRecords(userId: number, serverId: number) {
    return await this.repository.listUserServerRecords(userId, serverId);
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
      activeInternalSquads: ['f99e56f3-f961-44a1-b919-930643c0fc09'],
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

  async export() {
    const data = await this.repository.findAll();
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
      ];
    });
    return await exportToSheet(env.SHEET_ID, 'Users!A2', preparedData);
  }
}
