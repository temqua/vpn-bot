import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database.module';
import { UsersModule } from '../users.module';
import { UserExistsPipe } from '../user-exists-pipe';
import { UsersActionsController } from './users-actions.controller';
import { UsersActionsRepository } from './users-actions.repository';
import { UsersActionsService } from './users-actions.service';

@Module({
  controllers: [UsersActionsController],
  imports: [DatabaseModule, UsersModule],
  providers: [UsersActionsService, UsersActionsRepository, UserExistsPipe],
})
export class UsersActionsModule {}
