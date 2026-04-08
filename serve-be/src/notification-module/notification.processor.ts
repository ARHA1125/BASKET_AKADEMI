import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WahaService } from './waha.service';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../payment-module/entities/invoice.entity';
import { BroadcastLog, BroadcastStatus } from './entities/broadcast-log.entity';
import {
  NotificationDelivery,
  NotificationDeliveryKind,
  NotificationDeliveryStatus,
} from './entities/notification-delivery.entity';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly wahaService: WahaService,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(BroadcastLog)
    private readonly broadcastLogRepository: Repository<BroadcastLog>,
    @InjectRepository(NotificationDelivery)
    private readonly notificationDeliveryRepository: Repository<NotificationDelivery>,
  ) {
    super();
  }

  private extractExternalMessageId(response: any) {
    return (
      response?.id ??
      response?.message?.id ??
      response?.key?.id ??
      response?.data?.id ??
      null
    );
  }

  private async updateBroadcastProgress(
    broadcastLogId: string | null,
    outcome: 'sent' | 'failed',
    errorMessage?: string,
  ) {
    if (!broadcastLogId) {
      return;
    }

    const broadcastLog = await this.broadcastLogRepository.findOne({
      where: { id: broadcastLogId },
    });

    if (!broadcastLog) {
      return;
    }

    if (broadcastLog.status === BroadcastStatus.QUEUED) {
      broadcastLog.status = BroadcastStatus.SENDING;
      broadcastLog.startedAt = new Date();
    }

    if (outcome === 'sent') {
      broadcastLog.sentCount += 1;
    } else {
      broadcastLog.failedCount += 1;
      broadcastLog.lastError = errorMessage ?? broadcastLog.lastError;
    }

    if (broadcastLog.sentCount + broadcastLog.failedCount >= broadcastLog.queuedCount) {
      broadcastLog.completedAt = new Date();
      broadcastLog.status =
        broadcastLog.failedCount > 0 ? BroadcastStatus.FAILED : BroadcastStatus.COMPLETED;
    }

    await this.broadcastLogRepository.save(broadcastLog);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
    const { chatId, message, type, deliveryId } = job.data;
    const delivery = await this.notificationDeliveryRepository.findOne({
      where: { id: deliveryId },
    });

    if (!delivery) {
      this.logger.warn(`Skipping job ${job.id} because delivery ${deliveryId} was not found`);
      return;
    }

    const attempts = job.attemptsMade + 1;

    try {
      if (type === 'text') {
        const response = await this.wahaService.sendMessage(chatId, message, job.data.session);
        const externalMessageId = this.extractExternalMessageId(response);

        delivery.status = NotificationDeliveryStatus.SENT;
        delivery.sentAt = new Date();
        delivery.failedAt = null;
        delivery.error = null;
        delivery.attempts = attempts;
        delivery.externalMessageId = externalMessageId;
        await this.notificationDeliveryRepository.save(delivery);

        if (delivery.invoiceId) {
          const invoice = await this.invoiceRepository.findOne({
            where: { id: delivery.invoiceId },
          });

          if (invoice) {
            invoice.deliveryAttempts = attempts;
            invoice.deliveryError = null;
            if (delivery.kind === NotificationDeliveryKind.INVOICE) {
              invoice.deliveryStatus = 'SUDAH_TERKIRIM';
              invoice.deliverySentAt = delivery.sentAt;
            }
            if (delivery.kind === NotificationDeliveryKind.REMINDER) {
              invoice.lastReminderSentAt = delivery.sentAt;
            }
            await this.invoiceRepository.save(invoice);
          }
        }

        if (delivery.kind === NotificationDeliveryKind.BROADCAST) {
          await this.updateBroadcastProgress(delivery.broadcastLogId, 'sent');
        }

        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const maxAttempts = job.opts.attempts ?? 1;
      const isFinalAttempt = attempts >= maxAttempts;

      delivery.attempts = attempts;
      delivery.error = errorMessage;
      if (isFinalAttempt) {
        delivery.status = NotificationDeliveryStatus.FAILED;
        delivery.failedAt = new Date();
      }
      await this.notificationDeliveryRepository.save(delivery);

      if (delivery.invoiceId) {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: delivery.invoiceId },
        });

        if (invoice) {
          invoice.deliveryAttempts = attempts;
          invoice.deliveryError = errorMessage;
          await this.invoiceRepository.save(invoice);
        }
      }

      if (isFinalAttempt && delivery.kind === NotificationDeliveryKind.BROADCAST) {
        await this.updateBroadcastProgress(delivery.broadcastLogId, 'failed', errorMessage);
      }

      throw error;
    }
  }
}
