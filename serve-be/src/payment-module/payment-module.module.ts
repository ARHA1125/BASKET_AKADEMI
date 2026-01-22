import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModuleService } from './payment-module.service';
import { PaymentModuleController } from './payment-module.controller';
import { Invoice } from './entities/invoice.entity';
import { Transaction } from './entities/transaction.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Parent } from '../academic-module/entities/parent.entity';
import { SystemSetting } from './entities/system-setting.entity';

import { ReportController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Transaction, InvoiceItem, Parent, SystemSetting])],
  controllers: [PaymentModuleController, ReportController],
  providers: [PaymentModuleService],
  exports: [PaymentModuleService],
})
export class PaymentModuleModule {}
