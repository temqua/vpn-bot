import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { RemnawaveService } from './rw.service';

@Module({
  controllers: [UsersController],
  imports: [DatabaseModule],
  providers: [UsersService, RemnawaveService, UsersRepository],
})
export class UsersModule {}
