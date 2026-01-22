import { Injectable } from '@nestjs/common';
import { CreateMarketplaceModuleDto } from './dto/create-marketplace-module.dto';
import { UpdateMarketplaceModuleDto } from './dto/update-marketplace-module.dto';

@Injectable()
export class MarketplaceModuleService {
  create(createMarketplaceModuleDto: CreateMarketplaceModuleDto) {
    return 'This action adds a new marketplaceModule';
  }

  findAll() {
    return `This action returns all marketplaceModule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marketplaceModule`;
  }

  update(id: number, updateMarketplaceModuleDto: UpdateMarketplaceModuleDto) {
    return `This action updates a #${id} marketplaceModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketplaceModule`;
  }
}
