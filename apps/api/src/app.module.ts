import { Module } from '@nestjs/common';
import { UsersModule } from './entities/users/users.module';
import { PaymentsModule } from './entities/payments/payments.module';

@Module({
  imports: [UsersModule, PaymentsModule],
})
export class AppModule {}
