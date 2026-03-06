import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PaymentModuleService } from '../payment-module/payment-module.service';
import { NotificationService } from './notification.service';
import { Invoice, InvoiceStatus } from '../payment-module/entities/invoice.entity';

@Injectable()
export class InvoiceScheduler {
  private readonly logger = new Logger(InvoiceScheduler.name);

  constructor(
    private paymentService: PaymentModuleService,
    private notificationService: NotificationService,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>
  ) { }

 
  @Cron('0 * * * * *', {
    timeZone: 'Asia/Jakarta'
  }) 
  async handleMonthlyInvoices() {  
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentDay = jakartaTime.getDate();
    const currentTime = jakartaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
    
    const schedule = await this.paymentService.getSchedule();
    
    // this.logger.debug(`VPS Time: Day ${now.getDate()} @ ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
    // this.logger.debug(`Indonesia Time: Day ${currentDay} @ ${currentTime}`);
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

  @Cron('0 * * * * *', {
    timeZone: 'Asia/Jakarta'
  })
  async handleInvoiceReminders() {
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentDay = jakartaTime.getDate();
    const currentTime = jakartaTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
    
    const schedule = await this.paymentService.getReminderSchedule();
    
    if (currentDay !== schedule.day) {
        return;
    }

    if (currentTime !== schedule.time) {
        return;
    }

    this.logger.log(`Reminder Schedule Match (Day ${schedule.day} @ ${schedule.time}). Sending due date reminders...`);


    const overdueInvoices = await this.invoiceRepository.find({
        where: {
            status: InvoiceStatus.UNPAID,
            createdAt: LessThan(jakartaTime)
        },
        relations: [
            'parent',
            'parent.user',
            'items',
            'items.student',
            'items.student.user',
            'items.student.trainingClass'
        ],
    });

    if (overdueInvoices.length > 0) {
        this.logger.log(`Found ${overdueInvoices.length} unpaid invoices. Queuing reminders...`);
        await this.notificationService.sendInvoiceDueReminders(overdueInvoices);
    } else {
        this.logger.log(`No overdue invoices found that need a reminder today.`);
    }
  }
}
