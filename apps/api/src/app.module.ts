import { Module } from '@nestjs/common';
import { UsersModule } from './entities/users/users.module';
import { PaymentsModule } from './entities/payments/payments.module';
import { ExpensesModule } from './entities/expenses/expenses.module';
import { PlansModule } from './entities/plans/plans.module';
import { ServersModule } from './entities/servers/servers.module';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    ExpensesModule,
    PlansModule,
    ServersModule,
  ],
})
export class AppModule {}
