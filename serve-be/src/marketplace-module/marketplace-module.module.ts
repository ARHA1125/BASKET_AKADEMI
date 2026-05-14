import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceModuleService } from './marketplace-module.service';
import { MarketplaceModuleController } from './marketplace-module.controller';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { Category } from './entities/category.entity';
import { User } from '../auths-module/entities/user.entity';
import { Student } from '../academic-module/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Order, Category, User, Student]),
  ],
  controllers: [MarketplaceModuleController],
  providers: [MarketplaceModuleService],
})
export class MarketplaceModuleModule {}
