import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationService } from './administration-module.service';
import { AdministrationController } from './administration-module.controller';
import { Sponsor } from './entities/sponsor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor])],
  controllers: [AdministrationController],
  providers: [AdministrationService],
})
export class AdministrationModuleModule {}
