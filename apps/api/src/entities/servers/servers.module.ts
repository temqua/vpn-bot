import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { ServersRepository } from './servers.repository';

@Module({
  controllers: [ServersController],
  providers: [ServersService, ServersRepository],
})
export class ServersModule {}
