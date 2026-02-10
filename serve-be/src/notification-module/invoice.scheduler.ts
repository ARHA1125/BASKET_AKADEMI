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

  // Runs every minute, timezone-aware for Asia/Jakarta (Indonesia)
  @Cron('0 * * * * *', {
    timeZone: 'Asia/Jakarta'
  }) 
  async handleMonthlyInvoices() {
    // Get current time in Indonesia timezone
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentDay = jakartaTime.getDate();
    const currentTime = jakartaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
    
    const schedule = await this.paymentService.getSchedule();
    
    // Log for debugging timezone issues
    this.logger.debug(`VPS Time: Day ${now.getDate()} @ ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
    this.logger.debug(`Indonesia Time: Day ${currentDay} @ ${currentTime}`);
    this.logger.debug(`Schedule Config: Day ${schedule.day} @ ${schedule.time}`);

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
