import { Test, TestingModule } from '@nestjs/testing';
import { AiModuleController } from './ai-module.controller';
import { AiModuleService } from './ai-module.service';

describe('AiModuleController', () => {
  let controller: AiModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiModuleController],
      providers: [AiModuleService],
    }).compile();

    controller = module.get<AiModuleController>(AiModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
