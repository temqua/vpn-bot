import { Test, TestingModule } from '@nestjs/testing';
import { UsersServersService } from './users-servers.service';

describe('UsersServersService', () => {
  let service: UsersServersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersServersService],
    }).compile();

    service = module.get<UsersServersService>(UsersServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
