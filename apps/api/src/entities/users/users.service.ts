import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { SearchUserDto } from './dto/search-user.dto';
import { RemnawaveService } from './rw.service';

@Injectable()
export class UsersService {
  constructor(
    private repository: UsersRepository,
    private readonly rwService: RemnawaveService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.repository.create(createUserDto);
  }

  async findAll(dto: SearchUserDto) {
    if (dto.username) {
      return await this.repository.findByUsername(dto.username);
    }
    if (dto.firstName) {
      return await this.repository.findByFirstName(dto.firstName);
    }
    if (dto.telegramId) {
      return await this.repository.getByTelegramId(dto.telegramId);
    }

    return await this.repository.findAll();
  }

  async findOne(id: number) {
    const user = await this.repository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
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
}
