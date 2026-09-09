import { Module } from '@nestjs/common';
import { RemnawaveService } from './remnawave.service';

@Module({
  providers: [RemnawaveService],
  exports: [RemnawaveService],
})
export class RemnawaveModule {}
