import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceModuleService } from './marketplace-module.service';
import { MarketplaceModuleController } from './marketplace-module.controller';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order])],
  controllers: [MarketplaceModuleController],
  providers: [MarketplaceModuleService],
})
export class MarketplaceModuleModule {}
