import { Module } from '@nestjs/common';
import { NalogService } from './nalog.service';

@Module({
  providers: [NalogService],
})
export class NalogModule {}
