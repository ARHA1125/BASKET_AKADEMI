import { Controller, Post, Body, Get, HttpException, HttpStatus, Query, Param } from '@nestjs/common';
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
    const pendingInvoices = await this.paymentService.findUnsentInvoicesForCurrentMonth();
    return this.notificationService.sendInvoiceReminders(pendingInvoices);
  }

  // ─── BROADCAST ENDPOINTS ───

  @Get('broadcast/recipients')
  async getBroadcastRecipientCount() {
    const count = await this.notificationService.countBroadcastRecipients();
    return { count };
  }

  @Post('broadcast/send')
  async startBroadcast() {
    try {
      return await this.notificationService.startBroadcast();
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to start broadcast',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('broadcast/history')
  async getBroadcastHistory(@Query('limit') limit?: string) {
    return this.notificationService.getBroadcastLogs(limit ? parseInt(limit) : 10);
  }

  @Get('broadcast/:id')
  async getBroadcastDetail(@Param('id') id: string) {
    return this.notificationService.getBroadcastLog(id);
  }
}
