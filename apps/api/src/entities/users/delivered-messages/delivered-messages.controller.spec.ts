import { Test, TestingModule } from '@nestjs/testing';
import { DeliveredMessagesController } from './delivered-messages.controller';
import { DeliveredMessagesService } from './delivered-messages.service';

describe('DeliveredMessagesController', () => {
  let controller: DeliveredMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveredMessagesController],
      providers: [DeliveredMessagesService],
    }).compile();

    controller = module.get<DeliveredMessagesController>(
      DeliveredMessagesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
