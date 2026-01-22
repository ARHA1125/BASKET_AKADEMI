import { Test, TestingModule } from '@nestjs/testing';
import { CommunityModuleController } from './community-module.controller';
import { CommunityModuleService } from './community-module.service';

describe('CommunityModuleController', () => {
  let controller: CommunityModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityModuleController],
      providers: [CommunityModuleService],
    }).compile();

    controller = module.get<CommunityModuleController>(CommunityModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
