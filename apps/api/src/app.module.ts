import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ExpensesModule } from './entities/expenses/expenses.module';
import { PaymentsModule } from './entities/payments/payments.module';
import { PlansModule } from './entities/plans/plans.module';
import { ServersModule } from './entities/servers/servers.module';
import { UsersServersModule } from './entities/users-servers/users-servers.module';
import { DeliveredMessagesModule } from './entities/users/delivered-messages/delivered-messages.module';
import { UsersActionsModule } from './entities/users/users-actions/users-actions.module';
import { UsersModule } from './entities/users/users.module';
import { LogHttpExceptionFilter } from './log-exceptions-filter';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    ExpensesModule,
    PlansModule,
    ServersModule,
    UsersServersModule,
    UsersActionsModule,
    DeliveredMessagesModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LogHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
