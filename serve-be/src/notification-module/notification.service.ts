import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Invoice } from '../payment-module/entities/invoice.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async sendInvoiceReminders(invoices: Invoice[]) {
    this.logger.log(`Sending reminders for ${invoices.length} invoices...`);

    const monthYear = new Date().toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
    });

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
        'https://wirabhaktibasket.com/invoice';
      const message =
`*Tagihan Online*
Wirabhakti Basketball Club

*(INI HANYALAH TESTING, BALAS 'IYA' JIKA PESAN INI MASUK)*
*("faizal")*

Kepada Yth. Bapak / Ibu Wali Murid,
Kami informasikan tagihan kursus basket dengan detail berikut:
*Daftar Siswa:*
${studentDetails}

*Bulan:* ${monthYear}
*Total Biaya:* Rp ${new Intl.NumberFormat('id-ID').format(invoice.amount)}

Terima kasih atas kepercayaan Anda.
Hormat kami,
*Wirabhakti Basketball Club*
*Cek Nota Tagihan:*
${invoiceBaseUrl}/${invoice.id}`;

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
}
