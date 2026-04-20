import { Module } from '@nestjs/common';
import { DeliveredMessagesService } from './delivered-messages.service';
import { DeliveredMessagesController } from './delivered-messages.controller';
import { DeliveredMessagesRepository } from './delivered-messages.repository';
import { UserExistsPipe } from '../user-exists-pipe';
import { DatabaseModule } from '../../../database.module';
import { UsersModule } from '../users.module';

@Module({
  controllers: [DeliveredMessagesController],
  imports: [DatabaseModule, UsersModule],
  providers: [
    DeliveredMessagesService,
    DeliveredMessagesRepository,
    UserExistsPipe,
  ],
})
export class DeliveredMessagesModule {}
