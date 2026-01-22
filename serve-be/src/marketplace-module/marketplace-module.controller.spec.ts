import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceModuleController } from './marketplace-module.controller';
import { MarketplaceModuleService } from './marketplace-module.service';

describe('MarketplaceModuleController', () => {
  let controller: MarketplaceModuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceModuleController],
      providers: [MarketplaceModuleService],
    }).compile();

    controller = module.get<MarketplaceModuleController>(MarketplaceModuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
