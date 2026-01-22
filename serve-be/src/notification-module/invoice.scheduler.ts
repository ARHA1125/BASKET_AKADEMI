import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentModuleService } from '../payment-module/payment-module.service';
import { NotificationService } from './notification.service';

@Injectable()
export class InvoiceScheduler {
  private readonly logger = new Logger(InvoiceScheduler.name);

  constructor(
    private paymentService: PaymentModuleService,
    private notificationService: NotificationService
  ) { }

  @Cron('0 * * * * *') 
  async handleMonthlyInvoices() {
    const now = new Date();
    const currentDay = now.getDate();
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
    
    const schedule = await this.paymentService.getSchedule();
    

    if (currentDay !== schedule.day) {
        return;
    }


    if (currentTime !== schedule.time) {
        return;
    }

    this.logger.log(`Schedule Match (Day ${schedule.day} @ ${schedule.time}). Generating monthly invoices...`);
    const invoices = await this.paymentService.generateMonthlyInvoices();

    this.logger.log(`Generated ${invoices.length} invoices. Queuing notifications...`);
    
    await this.notificationService.sendInvoiceReminders(invoices);
  }
}
