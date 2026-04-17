import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { RemnawaveService } from './rw.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  imports: [DatabaseModule],
  providers: [UsersService, RemnawaveService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
