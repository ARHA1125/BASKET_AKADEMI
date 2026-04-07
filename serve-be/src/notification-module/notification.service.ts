import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Invoice } from '../payment-module/entities/invoice.entity';
import { User, UserRole } from '../auths-module/entities/user.entity';
import { MessageTemplate, TemplateType } from './entities/message-template.entity';
import { BroadcastLog, BroadcastStatus } from './entities/broadcast-log.entity';
import { Parent } from '../academic-module/entities/parent.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

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
  ) {}

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
    this.logger.log(`Sending reminders for ${invoices.length} invoices...`);

    const monthYear = new Date().toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

    // Fetch active template
    const activeTemplate = await this.templateRepository.findOne({
      where: { type: TemplateType.INVOICE, isActive: true },
      order: { createdAt: 'DESC' },
    });

    const defaultMessageTemplate = `*Tagihan Online*
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

    const templateContent = activeTemplate?.content || defaultMessageTemplate;

    let sentCount = 0;

    for (const invoice of invoices) {
      if (invoice.deliveryStatus === 'SUDAH_TERKIRIM') {
          continue; // Skip if already sent
      }

      const phone = invoice.parent?.user?.phoneNumber;
      if (!phone) continue;
      let chatId = phone.trim();
      if (chatId.startsWith('08')) {
        chatId = '62' + chatId.slice(1);
      }
      if (!chatId.endsWith('@c.us')) {
        chatId = `${chatId}@c.us`;
      }
      const studentDetails = invoice.items
        .map((item, index) => {
          const name = item.student?.user?.fullName ?? 'Siswa';
          const grade = item.student?.trainingClass?.name ?? '-';

          return `${index + 1}. *Nama Siswa:* ${name}\n   *Kelas:* ${grade}`;
        })
        .join('\n\n');
      const invoiceBaseUrl =
        process.env.INVOICE_BASE_URL ??
        'https://app.wirabhakti.my.id/invoice';
      const variables = {
        studentDetails: studentDetails,
        monthYear: monthYear,
        invoiceAmount: new Intl.NumberFormat('id-ID').format(invoice.amount),
        invoiceUrl: `${invoiceBaseUrl}/${invoice.id}`,
      };

      let message = templateContent;
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }

      await this.notificationQueue.add('send-invoice', {
        chatId,
        message,
        type: 'text',
      });

      // Update status
      invoice.deliveryStatus = 'SUDAH_TERKIRIM';
      await this.invoiceRepository.save(invoice);
      sentCount++;
    }

    return { sent: sentCount };
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

    const defaultMessageTemplate = `*Peringatan Jatuh Tempo Tagihan*
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

    const templateContent = activeTemplate?.content || defaultMessageTemplate;
    let sentCount = 0;

    for (const invoice of invoices) {
      if (invoice.status === 'PAID') continue; // Extra safety check

      const phone = invoice.parent?.user?.phoneNumber;
      if (!phone) continue;
      
      let chatId = phone.trim();
      if (chatId.startsWith('08')) {
        chatId = '62' + chatId.slice(1);
      }
      if (!chatId.endsWith('@c.us')) {
        chatId = `${chatId}@c.us`;
      }
      const studentDetails = invoice.items
        .map((item, index) => {
          const name = item.student?.user?.fullName ?? 'Siswa';
          const grade = item.student?.trainingClass?.name ?? '-';

          return `${index + 1}. *Nama Siswa:* ${name}\n   *Kelas:* ${grade}`;
        })
        .join('\n\n');
      
      const invoiceBaseUrl =
        process.env.INVOICE_BASE_URL ??
        'https://app.wirabhakti.my.id/invoice';
      
      const variables = {
        studentDetails: studentDetails,
        monthYear: monthYear,
        invoiceAmount: new Intl.NumberFormat('id-ID').format(invoice.amount),
        invoiceUrl: `${invoiceBaseUrl}/${invoice.id}`,
      };

      let message = templateContent;
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }

      await this.notificationQueue.add('send-invoice', {
        chatId,
        message,
        type: 'text',
      });

      sentCount++;
    }

    return { sent: sentCount };
  }

  // ─── BROADCAST FEATURE ───

  async getApprovedParents() {
    const parents = await this.parentRepository.find({
      relations: ['user', 'students', 'students.user', 'students.trainingClass'],
      where: {
        user: {
          role: UserRole.PARENT,
          status: 'Active',
        },
      },
    });

    // Filter to only those with a valid phone number (on User or Parent)
    return parents.filter(p => {
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
      throw new Error('No active broadcast template found. Please save a template first.');
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
      status: BroadcastStatus.SENDING,
    });
    const savedLog = await this.broadcastLogRepository.save(broadcastLog);

    this.logger.log(`Broadcasting to ${parents.length} approved parents (log: ${savedLog.id})`);

    // 4. Queue messages per parent with personalized variables
    let queuedCount = 0;
    for (const parent of parents) {
      const phone = parent.user?.phoneNumber?.trim() || parent.phoneNumber?.trim();
      if (!phone) continue;

      let chatId = phone.trim();
      if (chatId.startsWith('08')) {
        chatId = '62' + chatId.slice(1);
      }
      if (!chatId.endsWith('@c.us')) {
        chatId = `${chatId}@c.us`;
      }

      // Build personalized variables
      const studentNames = parent.students
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

      await this.notificationQueue.add('send-broadcast', {
        chatId,
        message,
        type: 'text',
        broadcastLogId: savedLog.id,
      });

      queuedCount++;
    }

    // 5. Update log
    savedLog.sentCount = queuedCount;
    savedLog.status = BroadcastStatus.QUEUED;
    await this.broadcastLogRepository.save(savedLog);

    return {
      broadcastId: savedLog.id,
      queued: queuedCount,
      totalRecipients: parents.length,
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
}

