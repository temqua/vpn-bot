import { Test, TestingModule } from '@nestjs/testing';
import { UsersServersController } from './users-servers.controller';
import { UsersServersService } from './users-servers.service';

describe('UsersServersController', () => {
  let controller: UsersServersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersServersController],
      providers: [UsersServersService],
    }).compile();

    controller = module.get<UsersServersController>(UsersServersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
