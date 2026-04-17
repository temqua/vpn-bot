import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UserExistsPipe implements PipeTransform {
  constructor(private readonly usersService: UsersService) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    const userId = Number(value);

    if (isNaN(userId)) {
      throw new NotFoundException(`User with id "${value}" not found`);
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // 💡 Возвращаем саму сущность User, чтобы не дёргать БД второй раз в сервисе
    return userId;
  }
}
