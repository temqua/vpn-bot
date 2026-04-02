import { Module } from '@nestjs/common';
import { UsersServersService } from './users-servers.service';
import { UsersServersController } from './users-servers.controller';
import { UsersServersRepository } from './users-servers.repository';

@Module({
  controllers: [UsersServersController],
  providers: [UsersServersService, UsersServersRepository],
})
export class UsersServersModule {}
