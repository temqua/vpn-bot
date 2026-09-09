import { Module } from '@nestjs/common';
import { RemnawaveService } from './remnawave.service';

@Module({
  providers: [RemnawaveService],
})
export class RemnawaveModule {}
