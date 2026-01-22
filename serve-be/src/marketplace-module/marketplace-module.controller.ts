import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketplaceModuleService } from './marketplace-module.service';
import { CreateMarketplaceModuleDto } from './dto/create-marketplace-module.dto';
import { UpdateMarketplaceModuleDto } from './dto/update-marketplace-module.dto';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';

@Roles(UserRole.ADMIN)
@Controller('marketplace-module')
export class MarketplaceModuleController {
  constructor(private readonly marketplaceModuleService: MarketplaceModuleService) {}

  @Post()
  create(@Body() createMarketplaceModuleDto: CreateMarketplaceModuleDto) {
    return this.marketplaceModuleService.create(createMarketplaceModuleDto);
  }

  @Get()
  findAll() {
    return this.marketplaceModuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketplaceModuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarketplaceModuleDto: UpdateMarketplaceModuleDto) {
    return this.marketplaceModuleService.update(+id, updateMarketplaceModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketplaceModuleService.remove(+id);
  }
}
