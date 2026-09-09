import { Test, TestingModule } from '@nestjs/testing';
import { RemnawaveService } from './remnawave.service';

describe('RemnawaveService', () => {
  let service: RemnawaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemnawaveService],
    }).compile();

    service = module.get<RemnawaveService>(RemnawaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
