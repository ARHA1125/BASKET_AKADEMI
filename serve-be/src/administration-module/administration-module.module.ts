import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationService } from './administration-module.service';
import { AdministrationController } from './administration-module.controller';
import { Sponsor } from './entities/sponsor.entity';
import { News } from './entities/news.entity';
import { Gallery } from './entities/gallery.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, News, Gallery])],
  controllers: [AdministrationController, NewsController, GalleryController],
  providers: [AdministrationService, NewsService, GalleryService],
})
export class AdministrationModuleModule {}
