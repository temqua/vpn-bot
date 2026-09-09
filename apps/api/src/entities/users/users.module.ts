import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { RemnawaveModule } from '../remnawave/remnawave.module';

@Module({
  controllers: [UsersController],
  imports: [RemnawaveModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
