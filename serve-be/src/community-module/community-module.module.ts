import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityModuleService } from './community-module.service';
import { CommunityModuleController } from './community-module.controller';
import { Event } from './entities/event.entity';
import { Squad } from './entities/squad.entity';
import { MatchStats } from './entities/match-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Squad, MatchStats])],
  controllers: [CommunityModuleController],
  providers: [CommunityModuleService],
})
export class CommunityModuleModule {}
