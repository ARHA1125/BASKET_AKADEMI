import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  Invoice,
  InvoiceStatus,
} from '../payment-module/entities/invoice.entity';
import { User, UserRole } from '../auths-module/entities/user.entity';
import {
  MessageTemplate,
  TemplateType,
} from './entities/message-template.entity';
import { BroadcastLog, BroadcastStatus } from './entities/broadcast-log.entity';
import { Parent } from '../academic-module/entities/parent.entity';
import {
  NotificationDelivery,
  NotificationDeliveryKind,
  NotificationDeliveryStatus,
} from './entities/notification-delivery.entity';

type QueueSchedulePolicy = {
  intervalMs: number;
  batchSize: number;
  batchPauseMs: number;
};

const DELIVERY_POLICIES: Record<NotificationDeliveryKind, QueueSchedulePolicy> =
  {
    [NotificationDeliveryKind.INVOICE]: {
      intervalMs: 60_000,
      batchSize: 20,
      batchPauseMs: 10 * 60_000,
    },
    [NotificationDeliveryKind.MANUAL_LATE_INVOICE]: {
      intervalMs: 75_000,
      batchSize: 15,
      batchPauseMs: 12 * 60_000,
    },
    [NotificationDeliveryKind.REMINDER]: {
      intervalMs: 60_000,
      batchSize: 20,
      batchPauseMs: 10 * 60_000,
    },
    [NotificationDeliveryKind.ACCEPTANCE]: {
      intervalMs: 75_000,
      batchSize: 15,
      batchPauseMs: 12 * 60_000,
    },
    [NotificationDeliveryKind.BROADCAST]: {
      intervalMs: 75_000,
      batchSize: 15,
      batchPauseMs: 12 * 60_000,
    },
  };

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly defaultInvoiceTemplate = `*Tagihan Online*
Wirabhakti Basketball Club

Kepada Yth. Bapak / Ibu Wali Murid,
Kami informasikan tagihan kursus basket dengan detail berikut:
*Daftar Siswa:*
{{studentDetails}}

*Bulan:* {{monthYear}}
*Total Biaya:* Rp {{invoiceAmount}}

Terima kasih atas kepercayaan Anda.
Hormat kami,
*Wirabhakti Basketball Club*
*Cek Nota Tagihan:*
{{invoiceUrl}}`;
  private readonly defaultReminderTemplate = `*Peringatan Jatuh Tempo Tagihan*
Wirabhakti Basketball Club

Yth. Bapak / Ibu Wali Murid,
Mohon maaf mengganggu waktunya. Kami informasikan bahwa terdapat tagihan kursus basket yang belum lunas:
*Daftar Siswa:*
{{studentDetails}}

*Bulan:* {{monthYear}}
*Total Biaya:* Rp {{invoiceAmount}}

Mohon segera melakukan pembayaran. Abaikan pesan ini jika sudah membayar.
*Cek Nota Tagihan:*
{{invoiceUrl}}`;
  private readonly defaultAcceptanceTemplate = `*Pesan Penerimaan Siswa*
Wirabhakti Basketball Club

Halo {{fullName}},

Selamat, pendaftaran siswa berikut telah disetujui:
{{studentDetails}}

Jumlah siswa disetujui: {{studentCount}}
Tanggal: {{date}}

Silakan login dan lanjutkan proses administrasi yang diperlukan.

Salam,
*Wirabhakti Basketball Club*`;

  constructor(
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(MessageTemplate)
    private readonly templateRepository: Repository<MessageTemplate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BroadcastLog)
    private readonly broadcastLogRepository: Repository<BroadcastLog>,
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(NotificationDelivery)
    private readonly notificationDeliveryRepository: Repository<NotificationDelivery>,
  ) {}

  private formatChatId(phone: string) {
    let chatId = phone.trim();
    if (chatId.startsWith('08')) {
      chatId = '62' + chatId.slice(1);
    }
    if (!chatId.endsWith('@c.us')) {
      chatId = `${chatId}@c.us`;
    }
    return chatId;
  }

  private calculateDelayMs(kind: NotificationDeliveryKind, queueIndex: number) {
    const policy = DELIVERY_POLICIES[kind];
    const batchBreaks = Math.floor(queueIndex / policy.batchSize);
    return queueIndex * policy.intervalMs + batchBreaks * policy.batchPauseMs;
  }

  private async createDelivery(
    kind: NotificationDeliveryKind,
    recipientChatId: string,
    delayMs: number,
    invoiceId?: string,
    broadcastLogId?: string,
  ) {
    const scheduledFor = new Date(Date.now() + delayMs);
    const delivery = this.notificationDeliveryRepository.create({
      kind,
      status: NotificationDeliveryStatus.QUEUED,
      recipientChatId,
      invoiceId: invoiceId ?? null,
      broadcastLogId: broadcastLogId ?? null,
      scheduledFor,
    });
    return this.notificationDeliveryRepository.save(delivery);
  }

  private async enqueueDeliveryJob(
    jobName: string,
    delivery: NotificationDelivery,
    message: string,
    delayMs: number,
  ) {
    await this.notificationQueue.add(
      jobName,
      {
        deliveryId: delivery.id,
        chatId: delivery.recipientChatId,
        message,
        type: 'text',
        kind: delivery.kind,
        invoiceId: delivery.invoiceId,
        broadcastLogId: delivery.broadcastLogId,
      },
      {
        jobId: delivery.id,
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2 * 60_000,
        },
        removeOnComplete: 200,
        removeOnFail: false,
      },
    );
  }

  private async hasActiveDelivery(
    invoiceId: string,
    kind: NotificationDeliveryKind,
  ) {
    const delivery = await this.notificationDeliveryRepository.findOne({
      where: {
        invoiceId,
        kind,
        status: In([
          NotificationDeliveryStatus.QUEUED,
          NotificationDeliveryStatus.SENT,
          NotificationDeliveryStatus.ACKED,
        ]),
      },
      order: { createdAt: 'DESC' },
    });

    return Boolean(delivery);
  }

  private estimateDurationMinutes(
    kind: NotificationDeliveryKind,
    queuedCount: number,
  ) {
    if (queuedCount <= 0) {
      return 0;
    }

    return Math.ceil(this.calculateDelayMs(kind, queuedCount - 1) / 60_000);
  }

  private buildInvoiceVariables(invoice: Invoice, monthYear?: string) {
    const studentDetails = invoice.items
      .map((item, index) => {
        const name = item.student?.user?.fullName ?? 'Siswa';
        const grade = item.student?.trainingClass?.name ?? '-';

        return `${index + 1}. *Nama Siswa:* ${name}\n   *Kelas:* ${grade}`;
      })
      .join('\n\n');
    const invoiceBaseUrl =
      process.env.INVOICE_BASE_URL ?? 'https://app.wirabhakti.my.id/invoice';

    return {
      studentDetails,
      monthYear: monthYear ?? this.getInvoiceMonthYear(invoice),
      invoiceAmount: new Intl.NumberFormat('id-ID').format(
        invoice.uniqueAmount || invoice.amount,
      ),
      invoiceUrl: `${invoiceBaseUrl}/${invoice.id}`,
    };
  }

  private buildAcceptanceVariables(target: {
    parentFullName: string;
    approvedStudents: Array<{ name: string; className?: string | null }>;
  }) {
    const approvedStudents = target.approvedStudents.filter(
      (student) => student.name.trim().length > 0,
    );
    const studentDetails = approvedStudents.length
      ? approvedStudents
          .map(
            (student, index) =>
              `${index + 1}. *Nama Siswa:* ${student.name}\n   *Kelas:* ${student.className || '-'}`,
          )
          .join('\n\n')
      : '1. *Nama Siswa:* Siswa\n   *Kelas:* -';

    return {
      fullName: target.parentFullName || 'Bapak/Ibu',
      studentNames: approvedStudents.length
        ? approvedStudents
            .map((student, index) => `${index + 1}. ${student.name}`)
            .join('\n')
        : '-',
      studentDetails,
      studentCount: String(approvedStudents.length || 0),
      date: new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  private applyTemplate(
    templateContent: string,
    variables: Record<string, string>,
  ) {
    let message = templateContent;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return message;
  }

  private async queueSingleDelivery(
    kind: NotificationDeliveryKind,
    recipientChatId: string,
    message: string,
    invoiceId?: string,
    broadcastLogId?: string,
  ) {
    const delivery = await this.createDelivery(
      kind,
      recipientChatId,
      0,
      invoiceId,
      broadcastLogId,
    );

    const jobName =
      kind === NotificationDeliveryKind.REMINDER
        ? 'send-reminder'
        : kind === NotificationDeliveryKind.ACCEPTANCE
          ? 'send-acceptance'
          : kind === NotificationDeliveryKind.BROADCAST
            ? 'send-broadcast'
            : 'send-invoice';

    await this.enqueueDeliveryJob(jobName, delivery, message, 0);
    return delivery;
  }

  private async findParentByChatId(chatId: string) {
    const parents = await this.parentRepository.find({
      relations: [
        'user',
        'students',
        'students.user',
        'students.trainingClass',
      ],
    });

    return (
      parents.find((parent) => {
        const phone =
          parent.user?.phoneNumber?.trim() || parent.phoneNumber?.trim();
        return phone ? this.formatChatId(phone) === chatId : false;
      }) ?? null
    );
  }

  private getInvoiceMonthYear(invoice: Invoice) {
    if (invoice.month) {
      const [month, year] = invoice.month
        .split('-')
        .map((value) => parseInt(value, 10));
      if (!Number.isNaN(month) && !Number.isNaN(year)) {
        return new Date(year, month - 1, 1).toLocaleString('id-ID', {
          month: 'long',
          year: 'numeric',
        });
      }
    }

    return invoice.createdAt.toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  }

  private async queueInvoiceMessages(
    invoices: Invoice[],
    kind:
      | NotificationDeliveryKind.INVOICE
      | NotificationDeliveryKind.MANUAL_LATE_INVOICE,
  ) {
    this.logger.log(
      `Queueing ${kind.toLowerCase()} sends for ${invoices.length} invoices...`,
    );

    const activeTemplate = await this.templateRepository.findOne({
      where: { type: TemplateType.INVOICE, isActive: true },
      order: { createdAt: 'DESC' },
    });

    const templateContent =
      activeTemplate?.content || this.defaultInvoiceTemplate;
    let queuedCount = 0;

    for (const invoice of invoices) {
      if (invoice.deliveryStatus === 'SUDAH_TERKIRIM') {
        continue;
      }

      if (await this.hasActiveDelivery(invoice.id, kind)) {
        continue;
      }

      const phone = invoice.parent?.user?.phoneNumber;
      if (!phone) continue;
      const chatId = this.formatChatId(phone);
      const variables = this.buildInvoiceVariables(invoice);
      const message = this.applyTemplate(templateContent, variables);

      const delayMs = this.calculateDelayMs(kind, queuedCount);
      const delivery = await this.createDelivery(
        kind,
        chatId,
        delayMs,
        invoice.id,
      );

      await this.enqueueDeliveryJob('send-invoice', delivery, message, delayMs);

      invoice.deliveryQueuedAt = delivery.scheduledFor;
      invoice.deliveryError = null;
      await this.invoiceRepository.save(invoice);
      queuedCount++;
    }

    return {
      queued: queuedCount,
      estimatedDurationMinutes: this.estimateDurationMinutes(kind, queuedCount),
    };
  }

  async getInvoiceRecipientUsers(): Promise<User[]> {
    const invoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'user')
      .getMany();

    const uniqueUsers = new Map<string, User>();
    for (const inv of invoices) {
      if (inv.parent && inv.parent.user && inv.parent.user.phoneNumber) {
        if (inv.parent.user.phoneNumber.trim().length > 0) {
          uniqueUsers.set(inv.parent.user.id, inv.parent.user);
        }
      }
    }
    return Array.from(uniqueUsers.values());
  }

  async sendInvoiceReminders(invoices: Invoice[]) {
    return this.queueInvoiceMessages(
      invoices,
      NotificationDeliveryKind.INVOICE,
    );
  }

  async sendManualLateInvoiceReminders(invoices: Invoice[]) {
    return this.queueInvoiceMessages(
      invoices,
      NotificationDeliveryKind.MANUAL_LATE_INVOICE,
    );
  }

  async sendInvoiceDueReminders(invoices: Invoice[]) {
    this.logger.log(`Sending due reminders for ${invoices.length} invoices...`);

    const monthYear = new Date().toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

    const activeTemplate = await this.templateRepository.findOne({
      where: { type: TemplateType.REMINDER, isActive: true },
      order: { createdAt: 'DESC' },
    });

    const templateContent =
      activeTemplate?.content || this.defaultReminderTemplate;
    let queuedCount = 0;

    for (const invoice of invoices) {
      if (invoice.status === InvoiceStatus.PAID) continue; // Extra safety check

      if (
        await this.hasActiveDelivery(
          invoice.id,
          NotificationDeliveryKind.REMINDER,
        )
      ) {
        continue;
      }

      const phone = invoice.parent?.user?.phoneNumber;
      if (!phone) continue;

      const chatId = this.formatChatId(phone);
      const variables = this.buildInvoiceVariables(invoice, monthYear);
      const message = this.applyTemplate(templateContent, variables);

      const delayMs = this.calculateDelayMs(
        NotificationDeliveryKind.REMINDER,
        queuedCount,
      );
      const delivery = await this.createDelivery(
        NotificationDeliveryKind.REMINDER,
        chatId,
        delayMs,
        invoice.id,
      );

      await this.enqueueDeliveryJob(
        'send-reminder',
        delivery,
        message,
        delayMs,
      );

      queuedCount++;
    }

    return {
      queued: queuedCount,
      estimatedDurationMinutes: this.estimateDurationMinutes(
        NotificationDeliveryKind.REMINDER,
        queuedCount,
      ),
    };
  }

  async sendAcceptanceMessages(
    approvals: Array<{
      parentPhone: string;
      parentFullName: string;
      approvedStudents: Array<{ name: string; className?: string | null }>;
    }>,
  ) {
    const activeTemplate = await this.templateRepository.findOne({
      where: { type: TemplateType.ACCEPTANCE, isActive: true },
      order: { createdAt: 'DESC' },
    });

    const templateContent =
      activeTemplate?.content || this.defaultAcceptanceTemplate;
    let queuedCount = 0;

    for (const approval of approvals) {
      if (!approval.parentPhone?.trim()) {
        continue;
      }

      const chatId = this.formatChatId(approval.parentPhone);
      const variables = this.buildAcceptanceVariables(approval);
      const message = this.applyTemplate(templateContent, variables);
      const delayMs = this.calculateDelayMs(
        NotificationDeliveryKind.ACCEPTANCE,
        queuedCount,
      );
      const delivery = await this.createDelivery(
        NotificationDeliveryKind.ACCEPTANCE,
        chatId,
        delayMs,
      );

      await this.enqueueDeliveryJob(
        'send-acceptance',
        delivery,
        message,
        delayMs,
      );
      queuedCount++;
    }

    return {
      queued: queuedCount,
      estimatedDurationMinutes: this.estimateDurationMinutes(
        NotificationDeliveryKind.ACCEPTANCE,
        queuedCount,
      ),
    };
  }

  // ─── BROADCAST FEATURE ───

  async getApprovedParents() {
    const parents = await this.parentRepository.find({
      relations: [
        'user',
        'students',
        'students.user',
        'students.trainingClass',
      ],
      where: {
        user: {
          role: UserRole.PARENT,
          status: 'Active',
        },
      },
    });

    // Filter to only those with a valid phone number (on User or Parent)
    return parents.filter((p) => {
      const phone = p.user?.phoneNumber?.trim() || p.phoneNumber?.trim();
      return phone && phone.length > 0;
    });
  }

  async countBroadcastRecipients(): Promise<number> {
    const parents = await this.getApprovedParents();
    return parents.length;
  }

  async startBroadcast() {
    this.logger.log('Starting broadcast...');

    // 1. Fetch active BROADCAST template
    const activeTemplate = await this.templateRepository.findOne({
      where: { type: TemplateType.BROADCAST, isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (!activeTemplate) {
      throw new Error(
        'No active broadcast template found. Please save a template first.',
      );
    }

    // 2. Fetch all approved parents with students
    const parents = await this.getApprovedParents();

    if (parents.length === 0) {
      throw new Error('No approved parents with valid phone numbers found.');
    }

    // 3. Create broadcast log
    const broadcastLog = this.broadcastLogRepository.create({
      templateContent: activeTemplate.content,
      totalRecipients: parents.length,
      status: BroadcastStatus.QUEUED,
    });
    const savedLog = await this.broadcastLogRepository.save(broadcastLog);

    this.logger.log(
      `Broadcasting to ${parents.length} approved parents (log: ${savedLog.id})`,
    );

    // 4. Queue messages per parent with personalized variables
    let queuedCount = 0;
    for (const parent of parents) {
      const phone =
        parent.user?.phoneNumber?.trim() || parent.phoneNumber?.trim();
      if (!phone) continue;

      const chatId = this.formatChatId(phone);

      // Build personalized variables
      const studentNames =
        parent.students
          ?.map((s, i) => {
            const name = s.user?.fullName ?? 'Siswa';
            const className = s.trainingClass?.name ?? '-';
            return `${i + 1}. ${name} (${className})`;
          })
          .join('\\n') || '-';

      const variables: Record<string, string> = {
        fullName: parent.user?.fullName || 'Bapak/Ibu',
        studentNames,
        studentCount: String(parent.students?.length || 0),
        date: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };

      let message = activeTemplate.content;
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      const delayMs = this.calculateDelayMs(
        NotificationDeliveryKind.BROADCAST,
        queuedCount,
      );
      const delivery = await this.createDelivery(
        NotificationDeliveryKind.BROADCAST,
        chatId,
        delayMs,
        undefined,
        savedLog.id,
      );

      await this.enqueueDeliveryJob(
        'send-broadcast',
        delivery,
        message,
        delayMs,
      );

      queuedCount++;
    }

    // 5. Update log
    savedLog.queuedCount = queuedCount;
    savedLog.sentCount = 0;
    savedLog.failedCount = 0;
    await this.broadcastLogRepository.save(savedLog);

    return {
      broadcastId: savedLog.id,
      queued: queuedCount,
      totalRecipients: parents.length,
      estimatedDurationMinutes: this.estimateDurationMinutes(
        NotificationDeliveryKind.BROADCAST,
        queuedCount,
      ),
    };
  }

  async getBroadcastLogs(limit = 10) {
    return this.broadcastLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getBroadcastLog(id: string) {
    return this.broadcastLogRepository.findOne({ where: { id } });
  }

  async getDeliveryOverview(limit = 20) {
    const deliveries = await this.notificationDeliveryRepository.find({
      order: { createdAt: 'DESC' },
      take: 500,
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activeStatuses = new Set<NotificationDeliveryStatus>([
      NotificationDeliveryStatus.QUEUED,
      NotificationDeliveryStatus.SENT,
    ]);

    const summary = {
      queued: deliveries.filter(
        (item) => item.status === NotificationDeliveryStatus.QUEUED,
      ).length,
      sent: deliveries.filter(
        (item) => item.status === NotificationDeliveryStatus.SENT,
      ).length,
      acked: deliveries.filter(
        (item) => item.status === NotificationDeliveryStatus.ACKED,
      ).length,
      failed: deliveries.filter(
        (item) => item.status === NotificationDeliveryStatus.FAILED,
      ).length,
      completedToday: deliveries.filter((item) => {
        const completedAt = item.ackedAt || item.sentAt;
        return completedAt ? new Date(completedAt) >= startOfToday : false;
      }).length,
    };

    const kinds = Object.values(NotificationDeliveryKind);
    const activeByKind = kinds
      .map((kind) => {
        const kindItems = deliveries.filter((item) => item.kind === kind);
        const activeItems = kindItems.filter((item) =>
          activeStatuses.has(item.status),
        );
        const queuedItems = kindItems.filter(
          (item) => item.status === NotificationDeliveryStatus.QUEUED,
        );
        const latestScheduledFor =
          queuedItems
            .map((item) => item.scheduledFor)
            .filter((value): value is Date => Boolean(value))
            .sort((left, right) => right.getTime() - left.getTime())[0] || null;
        const nextScheduledFor =
          queuedItems
            .map((item) => item.scheduledFor)
            .filter((value): value is Date => Boolean(value))
            .sort((left, right) => left.getTime() - right.getTime())[0] || null;

        const estimatedMinutesRemaining = latestScheduledFor
          ? Math.max(
              0,
              Math.ceil(
                (new Date(latestScheduledFor).getTime() - Date.now()) / 60_000,
              ),
            )
          : 0;

        return {
          kind,
          active: activeItems.length,
          queued: queuedItems.length,
          sent: kindItems.filter(
            (item) => item.status === NotificationDeliveryStatus.SENT,
          ).length,
          acked: kindItems.filter(
            (item) => item.status === NotificationDeliveryStatus.ACKED,
          ).length,
          failed: kindItems.filter(
            (item) => item.status === NotificationDeliveryStatus.FAILED,
          ).length,
          nextScheduledFor,
          latestScheduledFor,
          estimatedMinutesRemaining,
          isRunning: activeItems.length > 0,
        };
      })
      .filter(
        (item) =>
          item.active > 0 || item.failed > 0 || item.acked > 0 || item.sent > 0,
      );

    const recent = deliveries.slice(0, limit).map((item) => ({
      id: item.id,
      kind: item.kind,
      status: item.status,
      recipientChatId: item.recipientChatId,
      invoiceId: item.invoiceId,
      broadcastLogId: item.broadcastLogId,
      scheduledFor: item.scheduledFor,
      sentAt: item.sentAt,
      ackedAt: item.ackedAt,
      failedAt: item.failedAt,
      attempts: item.attempts,
      error: item.error,
      createdAt: item.createdAt,
    }));

    const runningBatches = activeByKind.reduce(
      (acc, item) => {
        acc[item.kind] = item.isRunning;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    return {
      summary,
      activeByKind,
      runningBatches,
      recent,
    };
  }

  async getDeliveryHistory(
    kind?: NotificationDeliveryKind,
    status?: NotificationDeliveryStatus,
    limit = 50,
  ) {
    const where = {
      ...(kind ? { kind } : {}),
      ...(status ? { status } : {}),
    };

    return this.notificationDeliveryRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async retryFailedDelivery(id: string) {
    const delivery = await this.notificationDeliveryRepository.findOne({
      where: { id },
    });

    if (!delivery) {
      throw new Error('Delivery not found.');
    }

    if (delivery.status !== NotificationDeliveryStatus.FAILED) {
      throw new Error('Only failed deliveries can be retried.');
    }

    if (
      delivery.kind === NotificationDeliveryKind.INVOICE ||
      delivery.kind === NotificationDeliveryKind.MANUAL_LATE_INVOICE ||
      delivery.kind === NotificationDeliveryKind.REMINDER
    ) {
      if (!delivery.invoiceId) {
        throw new Error('Invoice delivery has no invoice reference.');
      }

      const invoice = await this.invoiceRepository.findOne({
        where: { id: delivery.invoiceId },
        relations: [
          'parent',
          'parent.user',
          'items',
          'items.student',
          'items.student.user',
          'items.student.trainingClass',
        ],
      });

      if (!invoice) {
        throw new Error('Invoice not found for retry.');
      }

      const activeTemplate = await this.templateRepository.findOne({
        where: {
          type:
            delivery.kind === NotificationDeliveryKind.REMINDER
              ? TemplateType.REMINDER
              : TemplateType.INVOICE,
          isActive: true,
        },
        order: { createdAt: 'DESC' },
      });

      const templateContent =
        activeTemplate?.content ||
        (delivery.kind === NotificationDeliveryKind.REMINDER
          ? this.defaultReminderTemplate
          : this.defaultInvoiceTemplate);
      const message = this.applyTemplate(
        templateContent,
        this.buildInvoiceVariables(
          invoice,
          delivery.kind === NotificationDeliveryKind.REMINDER
            ? new Date().toLocaleString('id-ID', {
                month: 'long',
                year: 'numeric',
              })
            : undefined,
        ),
      );
      const retryDelivery = await this.queueSingleDelivery(
        delivery.kind,
        delivery.recipientChatId,
        message,
        delivery.invoiceId ?? undefined,
      );

      invoice.deliveryQueuedAt = retryDelivery.scheduledFor;
      invoice.deliveryError = null;
      await this.invoiceRepository.save(invoice);

      return { retried: true, deliveryId: retryDelivery.id };
    }

    if (delivery.kind === NotificationDeliveryKind.ACCEPTANCE) {
      const parent = await this.findParentByChatId(delivery.recipientChatId);
      if (!parent) {
        throw new Error('Parent recipient could not be resolved for retry.');
      }

      const activeTemplate = await this.templateRepository.findOne({
        where: { type: TemplateType.ACCEPTANCE, isActive: true },
        order: { createdAt: 'DESC' },
      });

      const approvedStudents =
        parent.students?.map((student) => ({
          name: student.user?.fullName ?? 'Siswa',
          className: student.trainingClass?.name ?? '-',
        })) || [];

      const templateContent =
        activeTemplate?.content || this.defaultAcceptanceTemplate;
      const message = this.applyTemplate(
        templateContent,
        this.buildAcceptanceVariables({
          parentFullName: parent.user?.fullName || 'Bapak/Ibu',
          approvedStudents,
        }),
      );
      const retryDelivery = await this.queueSingleDelivery(
        NotificationDeliveryKind.ACCEPTANCE,
        delivery.recipientChatId,
        message,
      );

      return { retried: true, deliveryId: retryDelivery.id };
    }

    if (delivery.kind === NotificationDeliveryKind.BROADCAST) {
      if (!delivery.broadcastLogId) {
        throw new Error('Broadcast delivery has no batch reference.');
      }

      const broadcastLog = await this.broadcastLogRepository.findOne({
        where: { id: delivery.broadcastLogId },
      });

      if (!broadcastLog) {
        throw new Error('Broadcast log not found for retry.');
      }

      const parent = await this.findParentByChatId(delivery.recipientChatId);
      if (!parent) {
        throw new Error('Parent recipient could not be resolved for retry.');
      }

      const variables: Record<string, string> = {
        fullName: parent.user?.fullName || 'Bapak/Ibu',
        studentNames:
          parent.students
            ?.map((s, i) => {
              const name = s.user?.fullName ?? 'Siswa';
              const className = s.trainingClass?.name ?? '-';
              return `${i + 1}. ${name} (${className})`;
            })
            .join('\n') || '-',
        studentCount: String(parent.students?.length || 0),
        date: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };
      const message = this.applyTemplate(
        broadcastLog.templateContent,
        variables,
      );
      const retryDelivery = await this.queueSingleDelivery(
        NotificationDeliveryKind.BROADCAST,
        delivery.recipientChatId,
        message,
        undefined,
        delivery.broadcastLogId,
      );

      return { retried: true, deliveryId: retryDelivery.id };
    }

    throw new Error('Unsupported delivery type for retry.');
  }
}
