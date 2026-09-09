import { Test, TestingModule } from '@nestjs/testing';
import { NalogService } from './nalog.service';

describe('NalogService', () => {
  let service: NalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NalogService],
    }).compile();

    service = module.get<NalogService>(NalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
