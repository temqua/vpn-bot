import { Test, TestingModule } from '@nestjs/testing';
import { DeliveredMessagesService } from './delivered-messages.service';

describe('DeliveredMessagesService', () => {
  let service: DeliveredMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveredMessagesService],
    }).compile();

    service = module.get<DeliveredMessagesService>(DeliveredMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
