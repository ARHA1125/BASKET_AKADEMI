import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModuleService } from './notification-module.service';
import { NotificationModuleController } from './notification-module.controller';
import { WahaController } from './waha.controller';
import { WahaService } from './waha.service';
import { NotificationProcessor } from './notification.processor';
import { InvoiceScheduler } from './invoice.scheduler';
import { NotificationRule } from './entities/notification-rule.entity';
import { NotificationRulesController } from './notification-rules.controller';
import { NotificationRulesService } from './notification-rules.service';
import { PaymentModuleModule } from '../payment-module/payment-module.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

import { Invoice } from '../payment-module/entities/invoice.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    TypeOrmModule.forFeature([NotificationRule, Invoice]),
    PaymentModuleModule
  ],
  controllers: [NotificationModuleController, WahaController, NotificationRulesController, NotificationController],
  providers: [
    NotificationModuleService,
    WahaService,
    NotificationProcessor,
    InvoiceScheduler,
    NotificationRulesService,
    NotificationService
  ],
  exports: [WahaService],
})
export class NotificationModuleModule {}
