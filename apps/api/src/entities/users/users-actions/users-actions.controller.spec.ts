import { Test, TestingModule } from '@nestjs/testing';
import { UsersActionsController } from './users-actions.controller';
import { UsersActionsService } from './users-actions.service';

describe('UsersActionsController', () => {
  let controller: UsersActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersActionsController],
      providers: [UsersActionsService],
    }).compile();

    controller = module.get<UsersActionsController>(UsersActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
