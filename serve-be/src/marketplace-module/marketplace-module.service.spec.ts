import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceModuleService } from './marketplace-module.service';

describe('MarketplaceModuleService', () => {
  let service: MarketplaceModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplaceModuleService],
    }).compile();

    service = module.get<MarketplaceModuleService>(MarketplaceModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
