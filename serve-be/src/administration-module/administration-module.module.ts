import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationService } from './administration-module.service';
import { AdministrationController } from './administration-module.controller';
import { Sponsor } from './entities/sponsor.entity';
import { News } from './entities/news.entity';
import { Gallery } from './entities/gallery.entity';
import { Testimonial } from './entities/testimonial.entity';
import { SystemFeedback } from './entities/system-feedback.entity';
import { Parent } from '../academic-module/entities/parent.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { SystemFeedbackService } from './system-feedback.service';
import { SystemFeedbackController } from './system-feedback.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsor, News, Gallery, Testimonial, SystemFeedback, Parent])],
  controllers: [
    AdministrationController,
    NewsController,
    GalleryController,
    TestimonialController,
    SystemFeedbackController,
  ],
  providers: [
    AdministrationService,
    NewsService,
    GalleryService,
    TestimonialService,
    SystemFeedbackService,
  ],
})
export class AdministrationModuleModule {}
