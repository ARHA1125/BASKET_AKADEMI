import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PaymentModuleService } from '../payment-module/payment-module.service';
import { Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../auths-module/entities/user.entity';
import {
  NotificationDeliveryKind,
  NotificationDeliveryStatus,
} from './entities/notification-delivery.entity';

@Roles(UserRole.ADMIN)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentModuleService,
  ) {}

  private async executeInvoiceCheckActions(
    parentIds: string[],
    currentAction: 'NONE' | 'GENERATE' | 'GENERATE_AND_SEND' | 'SEND',
    manualLateAction: 'NONE' | 'GENERATE' | 'GENERATE_AND_SEND' | 'SEND',
  ) {
    if (parentIds.length === 0) {
      return {
        generatedCurrent: 0,
        queuedCurrent: 0,
        estimatedCurrentMinutes: 0,
        generatedManualLate: 0,
        queuedManualLate: 0,
        estimatedManualLateMinutes: 0,
        items: await this.paymentService.getInvoiceCheckItems(),
      };
    }

    const { current, manualLate } =
      await this.paymentService.getInvoiceCheckTargets();
    const summary = {
      generatedCurrent: 0,
      queuedCurrent: 0,
      estimatedCurrentMinutes: 0,
      generatedManualLate: 0,
      queuedManualLate: 0,
      estimatedManualLateMinutes: 0,
    };

    if (currentAction !== 'NONE') {
      let currentInvoices =
        currentAction === 'GENERATE' || currentAction === 'GENERATE_AND_SEND'
          ? await this.paymentService.generateMonthlyInvoices({
              targetMonth: current.month,
              targetYear: current.year,
              invoiceDay: current.invoiceDay,
              invoiceTime: current.invoiceTime,
              parentIds,
            })
          : [];

      summary.generatedCurrent = currentInvoices.length;

      if (currentAction === 'SEND' || currentAction === 'GENERATE_AND_SEND') {
        if (currentInvoices.length === 0) {
          currentInvoices =
            await this.paymentService.findInvoicesForParentsAndMonth(
              parentIds,
              current.month,
              current.year,
            );
        }

        const sendResult =
          await this.notificationService.sendInvoiceReminders(currentInvoices);
        summary.queuedCurrent = sendResult.queued;
        summary.estimatedCurrentMinutes = sendResult.estimatedDurationMinutes;
      }
    }

    if (manualLate && manualLateAction !== 'NONE') {
      let manualLateInvoices =
        manualLateAction === 'GENERATE' ||
        manualLateAction === 'GENERATE_AND_SEND'
          ? await this.paymentService.generateMonthlyInvoices({
              targetMonth: manualLate.month,
              targetYear: manualLate.year,
              invoiceDay: manualLate.invoiceDay,
              invoiceTime: manualLate.invoiceTime,
              parentIds,
            })
          : [];

      summary.generatedManualLate = manualLateInvoices.length;

      if (
        manualLateAction === 'SEND' ||
        manualLateAction === 'GENERATE_AND_SEND'
      ) {
        if (manualLateInvoices.length === 0) {
          manualLateInvoices =
            await this.paymentService.findInvoicesForParentsAndMonth(
              parentIds,
              manualLate.month,
              manualLate.year,
            );
        }

        const sendResult =
          await this.notificationService.sendManualLateInvoiceReminders(
            manualLateInvoices,
          );
        summary.queuedManualLate = sendResult.queued;
        summary.estimatedManualLateMinutes =
          sendResult.estimatedDurationMinutes;
      }
    }

    return {
      ...summary,
      items: await this.paymentService.getInvoiceCheckItems(),
    };
  }

  @Get('invoices/check')
  async getInvoiceCheckItems() {
    return this.paymentService.getInvoiceCheckItems();
  }

  @Post('invoices/check/execute-one')
  async executeInvoiceCheckOne(
    @Body('parentId') parentId: string,
    @Body('currentAction')
    currentAction: 'NONE' | 'GENERATE' | 'GENERATE_AND_SEND' | 'SEND',
    @Body('manualLateAction')
    manualLateAction: 'NONE' | 'GENERATE' | 'GENERATE_AND_SEND' | 'SEND',
  ) {
    return this.executeInvoiceCheckActions(
      parentId ? [parentId] : [],
      currentAction || 'NONE',
      manualLateAction || 'NONE',
    );
  }

  @Post('invoices/check/execute-bulk')
  async executeInvoiceCheckBulk(
    @Body('parentIds') parentIds: string[],
    @Body('currentAction')
    currentAction: 'NONE' | 'GENERATE' | 'GENERATE_AND_SEND' | 'SEND',
    @Body('manualLateAction')
    manualLateAction: 'NONE' | 'GENERATE' | 'GENERATE_AND_SEND' | 'SEND',
  ) {
    return this.executeInvoiceCheckActions(
      parentIds || [],
      currentAction || 'NONE',
      manualLateAction || 'NONE',
    );
  }

  @Post('invoices/send-manual')
  async sendManualReminders() {
    const pendingInvoices =
      await this.paymentService.findUnsentInvoicesForCurrentMonth();
    return this.notificationService.sendInvoiceReminders(pendingInvoices);
  }

  @Post('invoices/send-manual-late')
  async sendManualLateInvoices(
    @Body('targetMonth') targetMonth: number,
    @Body('targetYear') targetYear: number,
    @Body('invoiceDay') invoiceDay: number,
    @Body('invoiceTime') invoiceTime: string,
  ) {
    const invoices = await this.paymentService.generateMonthlyInvoices({
      targetMonth,
      targetYear,
      invoiceDay,
      invoiceTime,
    });
    const deliveryResult =
      await this.notificationService.sendManualLateInvoiceReminders(invoices);
    await this.paymentService.disableManualLateInvoiceSchedule();

    return {
      generated: invoices.length,
      queued: deliveryResult.queued,
      estimatedDurationMinutes: deliveryResult.estimatedDurationMinutes,
    };
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
    } catch (error: unknown) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to start broadcast',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('broadcast/history')
  async getBroadcastHistory(@Query('limit') limit?: string) {
    return this.notificationService.getBroadcastLogs(
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('broadcast/:id')
  async getBroadcastDetail(@Param('id') id: string) {
    return this.notificationService.getBroadcastLog(id);
  }

  @Get('deliveries/overview')
  async getDeliveryOverview(@Query('limit') limit?: string) {
    return this.notificationService.getDeliveryOverview(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('deliveries/history')
  async getDeliveryHistory(
    @Query('kind') kind?: NotificationDeliveryKind,
    @Query('status') status?: NotificationDeliveryStatus,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getDeliveryHistory(
      kind,
      status,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('deliveries/retry/:id')
  async retryFailedDelivery(@Param('id') id: string) {
    return this.notificationService.retryFailedDelivery(id);
  }
}
