import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PaymentModuleService } from '../payment-module/payment-module.service';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';

@Roles(UserRole.ADMIN)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentModuleService
  ) {}

  @Post('invoices/send-manual')
  async sendManualReminders() {
    // 1. Get all invoices for the current month
    const invoices = await this.paymentService.findAllInvoices('current');
    
    // We need to map the raw result back to entities if findAllInvoices returns DTOs/Interfaces
    // However, PaymentModuleService.findAllInvoices currently returns formatted plain objects.
    // We need the ACTUAL entities to access relationships (parent, user, items) for the message template.
    // So we should add a method to PaymentModuleService to get RAW invoices or use findAllInvoices logic here?
    // Actually, let's add `findPendingInvoices` to PaymentModuleService. 
    // BUT for now, let's assume we can fetch them here or modify Service.
    
    // Simpler: Let's call a new method in PaymentModuleService that returns Entities
    const pendingInvoices = await this.paymentService.findCurrentMonthInvoicesEntities();
    
    return this.notificationService.sendInvoiceReminders(pendingInvoices);
  }
}
