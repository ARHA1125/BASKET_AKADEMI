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
import { MessageTemplate } from './entities/message-template.entity';
import { NotificationDelivery } from './entities/notification-delivery.entity';
import { MessageTemplateController } from './message-template.controller';
import { MessageTemplateService } from './message-template.service';

import { Invoice } from '../payment-module/entities/invoice.entity';
import { User } from '../auths-module/entities/user.entity';
import { BroadcastLog } from './entities/broadcast-log.entity';
import { Parent } from '../academic-module/entities/parent.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    TypeOrmModule.forFeature([
      NotificationRule,
      Invoice,
      MessageTemplate,
      User,
      BroadcastLog,
      Parent,
      NotificationDelivery,
    ]),
    PaymentModuleModule
  ],
  controllers: [
    NotificationModuleController, 
    WahaController, 
    NotificationRulesController, 
    NotificationController, 
    MessageTemplateController
  ],
  providers: [
    NotificationModuleService,
    WahaService,
    NotificationProcessor,
    InvoiceScheduler,
    NotificationRulesService,
    NotificationService,
    MessageTemplateService
  ],
  exports: [WahaService],
})
export class NotificationModuleModule {}
