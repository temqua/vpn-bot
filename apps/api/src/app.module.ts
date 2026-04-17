import { Module } from '@nestjs/common';
import { ExpensesModule } from './entities/expenses/expenses.module';
import { PaymentsModule } from './entities/payments/payments.module';
import { PlansModule } from './entities/plans/plans.module';
import { ServersModule } from './entities/servers/servers.module';
import { UsersServersModule } from './entities/users-servers/users-servers.module';
import { UsersModule } from './entities/users/users.module';
import { UsersActionsModule } from './entities/users/users-actions/users-actions.module';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    ExpensesModule,
    PlansModule,
    ServersModule,
    UsersServersModule,
    UsersActionsModule,
  ],
})
export class AppModule {}
