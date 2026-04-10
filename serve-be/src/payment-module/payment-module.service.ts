import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { CreatePaymentModuleDto } from './dto/create-payment-module.dto';
import { UpdatePaymentModuleDto } from './dto/update-payment-module.dto';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Parent } from '../academic-module/entities/parent.entity';
import { SystemSetting } from './entities/system-setting.entity';

type InvoiceCheckScopeStatus =
  | 'READY'
  | 'MISSING'
  | 'EXISTS_UNSENT'
  | 'EXISTS_SENT';

type InvoiceCheckScope = {
  monthKey: string | null;
  label: string | null;
  status: InvoiceCheckScopeStatus;
  invoiceId: string | null;
};

type InvoiceCheckTarget = {
  month: number;
  year: number;
  monthKey: string;
  label: string;
  invoiceDay: number;
  invoiceTime: string;
};

type InvoiceCheckItem = {
  parentId: string;
  parentName: string;
  phoneNumber: string | null;
  activeStudentCount: number;
  current: InvoiceCheckScope;
  manualLate: InvoiceCheckScope;
};

@Injectable()
export class PaymentModuleService {
  private static readonly MANUAL_LATE_INVOICE_ACTIVE =
    'MANUAL_LATE_INVOICE_ACTIVE';
  private static readonly MANUAL_LATE_INVOICE_TARGET_MONTH =
    'MANUAL_LATE_INVOICE_TARGET_MONTH';
  private static readonly MANUAL_LATE_INVOICE_TARGET_YEAR =
    'MANUAL_LATE_INVOICE_TARGET_YEAR';
  private static readonly MANUAL_LATE_INVOICE_EXEC_DAY =
    'MANUAL_LATE_INVOICE_EXEC_DAY';
  private static readonly MANUAL_LATE_INVOICE_EXEC_TIME =
    'MANUAL_LATE_INVOICE_EXEC_TIME';

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
  ) {}

  private getJakartaNow() {
    return new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
    );
  }

  private async getSetting(key: string) {
    const setting = await this.systemSettingRepository.findOne({
      where: { key },
    });
    return setting?.value ?? null;
  }

  private async setSetting(key: string, value: string) {
    let setting = await this.systemSettingRepository.findOne({
      where: { key },
    });
    if (!setting) {
      setting = this.systemSettingRepository.create({ key });
    }

    setting.value = value;
    await this.systemSettingRepository.save(setting);
  }

  private getMonthKey(month: number, year: number) {
    return `${String(month).padStart(2, '0')}-${year}`;
  }

  private getMonthLabel(month: number, year: number) {
    return new Date(year, month - 1, 1).toLocaleString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  }

  private getTargetInvoiceDate(
    targetMonth: number,
    targetYear: number,
    invoiceDay: number,
  ) {
    return this.getTargetInvoiceDateTime(
      targetMonth,
      targetYear,
      invoiceDay,
      '00:00',
    );
  }

  private getTargetInvoiceDateTime(
    targetMonth: number,
    targetYear: number,
    invoiceDay: number,
    invoiceTime: string,
  ) {
    const maxDay = new Date(targetYear, targetMonth, 0).getDate();
    const normalizedDay = Math.min(Math.max(invoiceDay, 1), maxDay);
    const [rawHour, rawMinute] = invoiceTime
      .split(':')
      .map((value) => parseInt(value, 10));
    const hour = Number.isNaN(rawHour) ? 0 : Math.min(Math.max(rawHour, 0), 23);
    const minute = Number.isNaN(rawMinute)
      ? 0
      : Math.min(Math.max(rawMinute, 0), 59);

    return new Date(
      targetYear,
      targetMonth - 1,
      normalizedDay,
      hour,
      minute,
      0,
      0,
    );
  }

  private resolveSelectedMonth(month?: number, year?: number) {
    const now = this.getJakartaNow();
    const resolvedMonth =
      month && month >= 1 && month <= 12 ? month : now.getMonth() + 1;
    const resolvedYear = year && year > 0 ? year : now.getFullYear();

    return {
      month: resolvedMonth,
      year: resolvedYear,
      label: new Date(resolvedYear, resolvedMonth - 1, 1).toLocaleString(
        'id-ID',
        {
          month: 'long',
          year: 'numeric',
        },
      ),
    };
  }

  private getMonthRange(month?: number, year?: number) {
    const selected = this.resolveSelectedMonth(month, year);

    return {
      ...selected,
      start: new Date(selected.year, selected.month - 1, 1, 0, 0, 0, 0),
      end: new Date(selected.year, selected.month, 0, 23, 59, 59, 999),
    };
  }

  private getPreviousMonthRange(month?: number, year?: number) {
    const current = this.getMonthRange(month, year);
    const previousDate = new Date(current.year, current.month - 2, 1);

    return this.getMonthRange(
      previousDate.getMonth() + 1,
      previousDate.getFullYear(),
    );
  }

  private getInvoiceAmount(invoice: Invoice) {
    return Number(invoice.uniqueAmount || invoice.amount || 0);
  }

  private isOutstandingStatus(status: InvoiceStatus) {
    return status === InvoiceStatus.UNPAID || status === InvoiceStatus.OVERDUE;
  }

  private mapInvoiceStatus(status: InvoiceStatus) {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'Sudah Bayar';
      case InvoiceStatus.OVERDUE:
        return 'Terlambat';
      case InvoiceStatus.CANCELLED:
        return 'Dibatalkan';
      case InvoiceStatus.UNPAID:
      default:
        return 'Belum Bayar';
    }
  }

  private getInvoiceStudentLabel(invoice: Invoice) {
    const uniqueStudents = [
      ...new Set(
        (invoice.items || [])
          .map((item) => item.student?.user?.fullName)
          .filter((name): name is string => Boolean(name)),
      ),
    ];

    if (uniqueStudents.length === 0) {
      return invoice.parent?.user?.fullName || 'Unknown';
    }

    if (uniqueStudents.length === 1) {
      return uniqueStudents[0];
    }

    return `${uniqueStudents[0]} (+${uniqueStudents.length - 1})`;
  }

  private getInvoiceDescription(invoice: Invoice) {
    const descriptions = [
      ...new Set(
        (invoice.items || [])
          .map((item) => item.description)
          .filter((description): description is string => Boolean(description)),
      ),
    ];

    if (descriptions.length === 0) {
      return 'Invoice Bulanan';
    }

    return descriptions.join('; ');
  }

  private async findInvoicesForMonthEntities(month?: number, year?: number) {
    const range = this.getMonthRange(month, year);

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where('invoice.createdAt >= :start AND invoice.createdAt <= :end', {
        start: range.start,
        end: range.end,
      })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  create(createPaymentModuleDto: CreatePaymentModuleDto) {
    return 'This action adds a new paymentModule';
  }

  async generateMonthlyInvoices(options?: {
    targetMonth?: number;
    targetYear?: number;
    invoiceDay?: number;
    invoiceTime?: string;
    parentIds?: string[];
  }) {
    const parentFilter = options?.parentIds?.length
      ? { id: In(options.parentIds) }
      : undefined;
    const parents = await this.parentRepository.find({
      where: parentFilter,
      relations: [
        'students',
        'students.user',
        'students.trainingClass',
        'user',
      ],
    });
    const invoices: Invoice[] = [];

    const jakartaDate = this.getJakartaNow();
    const targetMonth = options?.targetMonth ?? jakartaDate.getMonth() + 1;
    const targetYear = options?.targetYear ?? jakartaDate.getFullYear();
    const invoiceDay = options?.invoiceDay ?? jakartaDate.getDate();
    const invoiceTime =
      options?.invoiceTime ??
      jakartaDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    const invoiceDate = this.getTargetInvoiceDateTime(
      targetMonth,
      targetYear,
      invoiceDay,
      invoiceTime,
    );
    const monthStr = this.getMonthKey(targetMonth, targetYear);
    const monthNameId = this.getMonthLabel(targetMonth, targetYear);

    for (const parent of parents) {
      if (!parent.students || parent.students.length === 0) continue;

      const existingInvoice = await this.invoiceRepository.findOne({
        where: {
          parent: { id: parent.id },
          month: monthStr,
        },
      });

      if (existingInvoice) {
        continue;
      }

      const activeStudents = parent.students.filter(
        (student) => student.user?.status === 'Active',
      );

      if (activeStudents.length === 0) continue;

      const invoice = new Invoice();
      invoice.parent = parent;

      // Store the invoice inside the configured target period so history/report filters match.
      invoice.createdAt = invoiceDate;

      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 7);
      invoice.dueDate = dueDate;

      invoice.status = InvoiceStatus.UNPAID;
      invoice.month = monthStr;
      invoice.deliveryStatus = 'BELUM_TERKIRIM';
      invoice.items = [];
      let totalAmount = 0;

      const fullYear = targetYear;

      for (const student of activeStudents) {
        const item = new InvoiceItem();
        item.description = `SPP Bulanan - ${student.user?.fullName || 'Student'} - ${monthNameId} ${fullYear}`;
        item.amount = 100000;
        item.student = student;

        invoice.items.push(item);
        totalAmount += item.amount;
      }

      invoice.amount = totalAmount;

      const uniqueCode = Math.floor(Math.random() * 900) + 100;
      invoice.uniqueCode = uniqueCode;
      invoice.uniqueAmount = totalAmount + uniqueCode;

      const savedInvoice = await this.invoiceRepository.save(invoice);
      await this.invoiceRepository.update(savedInvoice.id, {
        createdAt: invoiceDate,
        dueDate,
      });
      savedInvoice.createdAt = invoiceDate;
      savedInvoice.dueDate = dueDate;
      invoices.push(savedInvoice);
    }

    return invoices;
  }

  async getInvoiceCheckTargets() {
    const now = this.getJakartaNow();
    const schedule = await this.getSchedule();
    const manualLateSchedule = await this.getManualLateInvoiceSchedule();

    const current: InvoiceCheckTarget = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      monthKey: this.getMonthKey(now.getMonth() + 1, now.getFullYear()),
      label: this.getMonthLabel(now.getMonth() + 1, now.getFullYear()),
      invoiceDay: schedule.day,
      invoiceTime: schedule.time,
    };

    const manualLate =
      manualLateSchedule.targetMonth && manualLateSchedule.targetYear
        ? {
            month: manualLateSchedule.targetMonth,
            year: manualLateSchedule.targetYear,
            monthKey: this.getMonthKey(
              manualLateSchedule.targetMonth,
              manualLateSchedule.targetYear,
            ),
            label: this.getMonthLabel(
              manualLateSchedule.targetMonth,
              manualLateSchedule.targetYear,
            ),
            invoiceDay: manualLateSchedule.executionDay || 1,
            invoiceTime: manualLateSchedule.executionTime || '00:00',
          }
        : null;

    return { current, manualLate };
  }

  async findInvoicesForParentsAndMonth(
    parentIds: string[],
    month: number,
    year: number,
  ) {
    if (parentIds.length === 0) {
      return [];
    }

    const monthKey = this.getMonthKey(month, year);

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where('parent.id IN (:...parentIds)', { parentIds })
      .andWhere('invoice.month = :monthKey', { monthKey })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async getInvoiceCheckItems(): Promise<InvoiceCheckItem[]> {
    const { current, manualLate } = await this.getInvoiceCheckTargets();
    const parents = await this.parentRepository.find({
      relations: ['user', 'students', 'students.user'],
    });

    const actionableParents = parents
      .map((parent) => {
        const activeStudents = (parent.students || []).filter(
          (student) => student.user?.status === 'Active',
        );

        return {
          parent,
          activeStudents,
        };
      })
      .filter(({ activeStudents }) => activeStudents.length > 0);

    if (actionableParents.length === 0) {
      return [];
    }

    const parentIds = actionableParents.map(({ parent }) => parent.id);
    const monthKeys = [current.monthKey, manualLate?.monthKey].filter(
      (value): value is string => Boolean(value),
    );

    const invoices = monthKeys.length
      ? await this.invoiceRepository
          .createQueryBuilder('invoice')
          .leftJoinAndSelect('invoice.parent', 'parent')
          .leftJoinAndSelect('parent.user', 'parentUser')
          .where('parent.id IN (:...parentIds)', { parentIds })
          .andWhere('invoice.month IN (:...monthKeys)', { monthKeys })
          .orderBy('invoice.createdAt', 'DESC')
          .getMany()
      : [];

    const invoiceMap = new Map<string, Invoice>();
    for (const invoice of invoices) {
      const key = `${invoice.parent?.id}:${invoice.month}`;
      if (!invoiceMap.has(key)) {
        invoiceMap.set(key, invoice);
      }
    }

    const toScope = (
      target: InvoiceCheckTarget | null,
      invoice?: Invoice,
    ): InvoiceCheckScope => {
      if (!target) {
        return {
          monthKey: null,
          label: null,
          status: 'READY',
          invoiceId: null,
        };
      }

      if (!invoice) {
        return {
          monthKey: target.monthKey,
          label: target.label,
          status: 'MISSING',
          invoiceId: null,
        };
      }

      return {
        monthKey: target.monthKey,
        label: target.label,
        status:
          invoice.deliveryStatus === 'BELUM_TERKIRIM'
            ? 'EXISTS_UNSENT'
            : 'EXISTS_SENT',
        invoiceId: invoice.id,
      };
    };

    return actionableParents
      .map(({ parent, activeStudents }) => {
        const currentInvoice = invoiceMap.get(`${parent.id}:${current.monthKey}`);
        const manualLateInvoice = manualLate
          ? invoiceMap.get(`${parent.id}:${manualLate.monthKey}`)
          : undefined;

        return {
          parentId: parent.id,
          parentName: parent.user?.fullName || 'Unknown Parent',
          phoneNumber: parent.user?.phoneNumber || parent.phoneNumber || null,
          activeStudentCount: activeStudents.length,
          current: toScope(current, currentInvoice),
          manualLate: toScope(manualLate, manualLateInvoice),
        };
      })
      .filter(
        (item) =>
          item.current.status === 'MISSING' ||
          item.current.status === 'EXISTS_UNSENT' ||
          item.manualLate.status === 'MISSING' ||
          item.manualLate.status === 'EXISTS_UNSENT',
      );
  }

  async calculatePayroll(period: string) {
    return [
      { coach: 'Coach Shin', sessions: 24, total: 4100000, status: 'PAID' },
      {
        coach: 'Coach Indra',
        sessions: 18,
        total: 2160000,
        status: 'PROCESSING',
      },
    ];
  }

  async createPaymentLink(invoiceId: string) {
    return `https://checkout.midtrans.com/${invoiceId}`;
  }

  async handlePaymentCallback(payload: any) {
    console.log('Payment Callback:', payload);
    return { status: 'ok' };
  }

  findAll() {
    return `This action returns all paymentModule`;
  }

  async findOne(id: string) {
    // Sanitize the ID to fix links containing trailing punctuation (e.g. `; or backticks)
    const cleanId = id.replace(/[^a-fA-F0-9-]/g, '');

    // Validate UUID format before querying to prevent Postgres QueryFailedError
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
      return null;
    }

    const invoice = await this.invoiceRepository.findOne({
      where: { id: cleanId },
      relations: [
        'items',
        'items.student',
        'items.student.user',
        'items.student.trainingClass',
        'parent',
        'parent.user',
      ],
    });

    return invoice;
  }

  update(id: string, updatePaymentModuleDto: UpdatePaymentModuleDto) {
    return `This action updates a #${id} paymentModule`;
  }

  async getSchedule() {
    const daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_DAY' },
    });
    const timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_TIME' },
    });

    return {
      day: daySetting ? parseInt(daySetting.value) : 1,
      time: timeSetting ? timeSetting.value : '00:00',
    };
  }

  async setSchedule(day: number, time: string) {
    let daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_DAY' },
    });
    if (!daySetting) {
      daySetting = this.systemSettingRepository.create({
        key: 'INVOICE_GENERATION_DAY',
      });
    }
    daySetting.value = day.toString();
    await this.systemSettingRepository.save(daySetting);

    let timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'INVOICE_GENERATION_TIME' },
    });
    if (!timeSetting) {
      timeSetting = this.systemSettingRepository.create({
        key: 'INVOICE_GENERATION_TIME',
      });
    }
    timeSetting.value = time;
    return this.systemSettingRepository.save(timeSetting);
  }

  async getReminderSchedule() {
    const daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_DAY' },
    });
    const timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_TIME' },
    });

    return {
      day: daySetting ? parseInt(daySetting.value) : 1, // Default to 1st of month maybe, or empty?
      time: timeSetting ? timeSetting.value : '09:00', // Default morning
    };
  }

  async setReminderSchedule(day: number, time: string) {
    let daySetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_DAY' },
    });
    if (!daySetting) {
      daySetting = this.systemSettingRepository.create({
        key: 'REMINDER_GENERATION_DAY',
      });
    }
    daySetting.value = day.toString();
    await this.systemSettingRepository.save(daySetting);

    let timeSetting = await this.systemSettingRepository.findOne({
      where: { key: 'REMINDER_GENERATION_TIME' },
    });
    if (!timeSetting) {
      timeSetting = this.systemSettingRepository.create({
        key: 'REMINDER_GENERATION_TIME',
      });
    }
    timeSetting.value = time;
    return this.systemSettingRepository.save(timeSetting);
  }

  async getManualLateInvoiceSchedule() {
    const [isActive, targetMonth, targetYear, executionDay, executionTime] =
      await Promise.all([
        this.getSetting(PaymentModuleService.MANUAL_LATE_INVOICE_ACTIVE),
        this.getSetting(PaymentModuleService.MANUAL_LATE_INVOICE_TARGET_MONTH),
        this.getSetting(PaymentModuleService.MANUAL_LATE_INVOICE_TARGET_YEAR),
        this.getSetting(PaymentModuleService.MANUAL_LATE_INVOICE_EXEC_DAY),
        this.getSetting(PaymentModuleService.MANUAL_LATE_INVOICE_EXEC_TIME),
      ]);

    return {
      isActive: isActive === 'true',
      targetMonth: targetMonth ? parseInt(targetMonth, 10) : null,
      targetYear: targetYear ? parseInt(targetYear, 10) : null,
      executionDay: executionDay ? parseInt(executionDay, 10) : null,
      executionTime: executionTime || '00:00',
    };
  }

  async setManualLateInvoiceSchedule(config: {
    isActive: boolean;
    targetMonth: number;
    targetYear: number;
    executionDay: number;
    executionTime: string;
  }) {
    if (config.targetMonth < 1 || config.targetMonth > 12) {
      throw new Error('Target month must be between 1 and 12');
    }

    if (config.targetYear < 2000) {
      throw new Error('Target year is invalid');
    }

    if (config.executionDay < 1 || config.executionDay > 31) {
      throw new Error('Execution day must be between 1 and 31');
    }

    const now = this.getJakartaNow();
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();
    const targetMonthIndex = config.targetYear * 12 + (config.targetMonth - 1);

    if (targetMonthIndex > currentMonthIndex) {
      throw new Error(
        'Manual late invoice can only target the current or a past month',
      );
    }

    await Promise.all([
      this.setSetting(
        PaymentModuleService.MANUAL_LATE_INVOICE_ACTIVE,
        String(config.isActive),
      ),
      this.setSetting(
        PaymentModuleService.MANUAL_LATE_INVOICE_TARGET_MONTH,
        String(config.targetMonth),
      ),
      this.setSetting(
        PaymentModuleService.MANUAL_LATE_INVOICE_TARGET_YEAR,
        String(config.targetYear),
      ),
      this.setSetting(
        PaymentModuleService.MANUAL_LATE_INVOICE_EXEC_DAY,
        String(config.executionDay),
      ),
      this.setSetting(
        PaymentModuleService.MANUAL_LATE_INVOICE_EXEC_TIME,
        config.executionTime,
      ),
    ]);

    return this.getManualLateInvoiceSchedule();
  }

  async disableManualLateInvoiceSchedule() {
    await this.setSetting(
      PaymentModuleService.MANUAL_LATE_INVOICE_ACTIVE,
      'false',
    );
    return this.getManualLateInvoiceSchedule();
  }

  async manualGenerate() {
    return this.generateMonthlyInvoices();
  }

  async findAllInvoices(
    filter: 'current' | 'history',
    month?: number,
    year?: number,
  ) {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .orderBy('invoice.createdAt', 'DESC');

    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      query.where('invoice.createdAt >= :start AND invoice.createdAt <= :end', {
        start: startOfMonth,
        end: endOfMonth,
      });

      if (filter === 'current') {
        // If they are on "Aktif" tab but select a month, maybe keep only unpaid ones
        query.andWhere('invoice.status = :status', {
          status: InvoiceStatus.UNPAID,
        });
      }
    } else if (filter === 'current') {
      const jakartaTimeStr = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
      });
      const jakartaDate = new Date(jakartaTimeStr);

      const startOfMonth = new Date(
        jakartaDate.getFullYear(),
        jakartaDate.getMonth(),
        1,
      );

      // Allow unpaid invoices from previous months to be shown in 'current'
      query.where('(invoice.createdAt >= :start OR invoice.status = :status)', {
        start: startOfMonth,
        status: InvoiceStatus.UNPAID,
      });
    }

    const invoices = await query.getMany();

    return invoices.map((inv) => {
      const uniqueStudents = [
        ...new Set(
          inv.items.map((i) => i.student?.user?.fullName || 'Unknown'),
        ),
      ];
      const studentName =
        uniqueStudents.length > 1
          ? `${uniqueStudents[0]} (+${uniqueStudents.length - 1})`
          : uniqueStudents[0];

      return {
        id: inv.id,
        student: studentName || 'Unknown',
        category: 'SPP Bulanan',
        date: new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Jakarta',
        }).format(inv.createdAt),
        amount: inv.amount,
        uniqueCode: inv.uniqueCode,
        uniqueAmount: inv.uniqueAmount,
        paymentMethod: inv.paymentMethod,
        status: inv.status.toLowerCase(),
        method: '-',
        photoUrl: inv.photo_url,
        isVerified: inv.isVerified || false,
        verifiedAt: inv.verifiedAt,
        verifiedBy: inv.verifiedBy,
      };
    });
  }

  async deleteAllInvoices(filter: 'current' | 'history') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const query = this.invoiceRepository.createQueryBuilder('invoice');

    if (filter === 'current') {
      query.where('invoice.createdAt >= :start', { start: startOfMonth });
    } else {
      query.where('invoice.createdAt < :start', { start: startOfMonth });
    }

    const invoicesToDelete = await query.getMany();

    if (invoicesToDelete.length === 0) {
      return {
        deleted: false,
        count: 0,
        message: 'No invoices found to delete.',
      };
    }

    await this.invoiceRepository.remove(invoicesToDelete);

    return { deleted: true, count: invoicesToDelete.length };
  }

  async remove(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!invoice) return { deleted: false, message: 'Invoice not found' };

    await this.invoiceRepository.remove(invoice);
    return { deleted: true, id };
  }

  async getOverviewData(month?: number, year?: number) {
    const currentRange = this.getMonthRange(month, year);
    const previousRange = this.getPreviousMonthRange(month, year);

    const [currentMonthInvoices, previousMonthPaidInvoices] = await Promise.all(
      [
        this.invoiceRepository.find({
          where: {
            createdAt: Between(currentRange.start, currentRange.end),
          },
        }),
        this.invoiceRepository.find({
          where: {
            createdAt: Between(previousRange.start, previousRange.end),
            status: InvoiceStatus.PAID,
          },
        }),
      ],
    );

    const totalRevenue = currentMonthInvoices
      .filter((invoice) => invoice.status === InvoiceStatus.PAID)
      .reduce((sum, invoice) => sum + this.getInvoiceAmount(invoice), 0);

    const targetRevenue =
      currentMonthInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.amount || 0),
        0,
      ) || 70000000;

    const lastMonthRevenue = previousMonthPaidInvoices.reduce(
      (sum, invoice) => sum + this.getInvoiceAmount(invoice),
      0,
    );

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = Math.round(
        ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
      );
    } else if (totalRevenue > 0) {
      revenueGrowth = 100;
    }

    const outstandingInvoices = currentMonthInvoices.filter((invoice) =>
      this.isOutstandingStatus(invoice.status),
    );
    const agingAR = outstandingInvoices.reduce(
      (sum, invoice) => sum + this.getInvoiceAmount(invoice),
      0,
    );
    const agingStudents = outstandingInvoices.length;

    const overdueThreshold = new Date(currentRange.end);
    overdueThreshold.setDate(overdueThreshold.getDate() - 30);

    const overdueInvoices = outstandingInvoices.filter(
      (invoice) =>
        invoice.dueDate && new Date(invoice.dueDate) < overdueThreshold,
    );
    const overdueAmount = overdueInvoices.reduce(
      (sum, invoice) => sum + this.getInvoiceAmount(invoice),
      0,
    );

    const payrolls = await this.calculatePayroll(
      `${currentRange.year}-${String(currentRange.month).padStart(2, '0')}`,
    );
    const estimatedExpenses = payrolls.reduce(
      (sum, payroll) => sum + Number(payroll.total || 0),
      0,
    );

    const netProfit = totalRevenue - estimatedExpenses;
    let grossMargin = 0;
    if (totalRevenue > 0) {
      grossMargin = Math.round((netProfit / totalRevenue) * 100);
    } else if (netProfit < 0) {
      grossMargin = -100;
    }

    const cashFlow: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const referenceDate = new Date(
        currentRange.year,
        currentRange.month - 1 - i,
        1,
      );
      const monthStart = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
      const monthEnd = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const monthInvoices = await this.invoiceRepository.find({
        where: {
          createdAt: Between(monthStart, monthEnd),
        },
      });

      const income = monthInvoices
        .filter((invoice) => invoice.status === InvoiceStatus.PAID)
        .reduce((sum, invoice) => sum + this.getInvoiceAmount(invoice), 0);

      const expense = monthInvoices
        .filter((invoice) => this.isOutstandingStatus(invoice.status))
        .reduce((sum, invoice) => sum + this.getInvoiceAmount(invoice), 0);

      cashFlow.push({
        month: referenceDate.toLocaleString('id-ID', { month: 'short' }),
        income,
        expense,
      });
    }

    const recentTransactions = currentMonthInvoices
      .filter((invoice) => invoice.status === InvoiceStatus.PAID)
      .sort((left, right) => {
        const leftTime = left.verifiedAt
          ? new Date(left.verifiedAt).getTime()
          : 0;
        const rightTime = right.verifiedAt
          ? new Date(right.verifiedAt).getTime()
          : 0;
        return rightTime - leftTime;
      })
      .slice(0, 5)
      .map((invoice) => ({
        id: invoice.id,
        title: this.getInvoiceDescription(invoice),
        date: invoice.verifiedAt
          ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Jakarta',
            }).format(invoice.verifiedAt)
          : '-',
        amount: this.getInvoiceAmount(invoice),
        type: 'income' as const,
      }));

    return {
      totalRevenue,
      targetRevenue,
      revenueGrowth,
      agingAR,
      agingStudents,
      overdueAmount,
      netProfit,
      grossMargin,
      cashFlow,
      recentTransactions,
      selectedMonth: currentRange.month,
      selectedYear: currentRange.year,
      selectedMonthLabel: currentRange.label,
    };
  }

  async generateMonthlyReport(month?: number, year?: number) {
    const selected = this.getMonthRange(month, year);
    const [overview, invoices] = await Promise.all([
      this.getOverviewData(selected.month, selected.year),
      this.findInvoicesForMonthEntities(selected.month, selected.year),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OpenCode';
    workbook.created = new Date();

    const dashboardSheet = workbook.addWorksheet('Dashboard');
    const rawDataSheet = workbook.addWorksheet('Raw Data');

    rawDataSheet.columns = [
      { header: 'ID Transaksi', key: 'transactionId', width: 22 },
      { header: 'Tanggal', key: 'date', width: 14 },
      { header: 'Bulan', key: 'month', width: 12 },
      { header: 'Nama Siswa', key: 'studentName', width: 28 },
      { header: 'Keterangan', key: 'description', width: 48 },
      { header: 'Jatuh Tempo', key: 'dueDate', width: 14 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Nominal (Rp)', key: 'amount', width: 18 },
    ];

    rawDataSheet.getRow(1).font = { bold: true };
    rawDataSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };

    const rawRows = invoices.map((invoice) => ({
      transactionId: invoice.id,
      date: new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
      }).format(invoice.createdAt),
      month: new Date(selected.year, selected.month - 1, 1).toLocaleString(
        'id-ID',
        { month: 'short' },
      ),
      studentName: this.getInvoiceStudentLabel(invoice),
      description: this.getInvoiceDescription(invoice),
      dueDate: new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
      }).format(invoice.dueDate),
      status: this.mapInvoiceStatus(invoice.status),
      amount: this.getInvoiceAmount(invoice),
    }));

    if (rawRows.length > 0) {
      rawDataSheet.addRows(rawRows);
      rawDataSheet.getColumn('amount').numFmt = '#,##0';
    } else {
      rawDataSheet.addRow({
        transactionId: '-',
        date: '-',
        month: new Date(selected.year, selected.month - 1, 1).toLocaleString(
          'id-ID',
          { month: 'short' },
        ),
        studentName: 'Belum ada transaksi',
        description: '-',
        dueDate: '-',
        status: '-',
        amount: 0,
      });
      rawDataSheet.getColumn('amount').numFmt = '#,##0';
    }

    dashboardSheet.columns = [
      { width: 22 },
      { width: 18 },
      { width: 18 },
      { width: 6 },
      { width: 18 },
      { width: 28 },
      { width: 18 },
    ];

    dashboardSheet.mergeCells('A1:G1');
    dashboardSheet.getCell('A1').value = `Dashboard - ${selected.label}`;
    dashboardSheet.getCell('A1').font = { bold: true, size: 16 };

    dashboardSheet.getCell('A2').value = 'Total Revenue (Bulan Ini)';
    dashboardSheet.getCell('A3').value = overview.totalRevenue;
    dashboardSheet.getCell('A3').numFmt = '"Rp" #,##0';
    dashboardSheet.getCell('B3').value =
      `${overview.revenueGrowth > 0 ? '+' : ''}${overview.revenueGrowth}%`;
    dashboardSheet.getCell('A4').value =
      `Target: Rp ${overview.targetRevenue.toLocaleString('id-ID')}`;

    dashboardSheet.getCell('E2').value = 'Aging AR (Belum Lunas)';
    dashboardSheet.getCell('E3').value = overview.agingAR;
    dashboardSheet.getCell('E3').numFmt = '"Rp" #,##0';
    dashboardSheet.getCell('F3').value = `${overview.agingStudents} Siswa`;
    dashboardSheet.getCell('G3').value = '⚠️';
    dashboardSheet.getCell('E4').value =
      `Jatuh Tempo > 30 hari: Rp ${overview.overdueAmount.toLocaleString('id-ID')}`;

    ['A2', 'E2', 'A6', 'E6'].forEach((cellRef) => {
      dashboardSheet.getCell(cellRef).font = { bold: true };
    });

    dashboardSheet.getCell('A6').value = 'Tren Arus Kas';
    dashboardSheet.getCell('A7').value = 'Bulan';
    dashboardSheet.getCell('B7').value = 'Sudah Bayar';
    dashboardSheet.getCell('C7').value = 'Belum Bayar';

    overview.cashFlow.forEach((item, index) => {
      const row = 8 + index;
      dashboardSheet.getCell(`A${row}`).value = item.month;
      dashboardSheet.getCell(`B${row}`).value = item.income;
      dashboardSheet.getCell(`C${row}`).value = item.expense;
      dashboardSheet.getCell(`B${row}`).numFmt = '"Rp" #,##0';
      dashboardSheet.getCell(`C${row}`).numFmt = '"Rp" #,##0';
    });

    dashboardSheet.getCell('E6').value = 'Transaksi Terkini';
    dashboardSheet.getCell('E7').value = 'Tanggal';
    dashboardSheet.getCell('F7').value = 'Nama Siswa';
    dashboardSheet.getCell('G7').value = 'Nominal';

    const transactions =
      overview.recentTransactions.length > 0
        ? overview.recentTransactions
        : [
            {
              id: 'empty',
              date: 'Belum ada transaksi',
              title: '-',
              amount: 0,
              type: 'income' as const,
            },
          ];

    transactions.forEach((transaction, index) => {
      const row = 8 + index;
      dashboardSheet.getCell(`E${row}`).value = transaction.date;
      dashboardSheet.getCell(`F${row}`).value = transaction.title;
      dashboardSheet.getCell(`G${row}`).value = transaction.amount;
      dashboardSheet.getCell(`G${row}`).numFmt = '"Rp" #,##0';
    });

    dashboardSheet.getCell(`E${8 + transactions.length + 1}`).value =
      '[Lihat Semua Transaksi]';

    const borderedAreas = ['A2:C4', 'E2:G4', 'A6:C13', 'E6:G15'];
    borderedAreas.forEach((rangeRef) => {
      const [startCell, endCell] = rangeRef.split(':');
      const start = dashboardSheet.getCell(startCell);
      const end = dashboardSheet.getCell(endCell);

      for (let row = start.row; row <= end.row; row += 1) {
        for (let col = start.col; col <= end.col; col += 1) {
          dashboardSheet.getCell(row, col).border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          };
        }
      }
    });

    const highlightedHeaders = ['A2', 'E2', 'A6', 'E6'];
    highlightedHeaders.forEach((cellRef) => {
      dashboardSheet.getCell(cellRef).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF6FF' },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      buffer: Buffer.from(buffer),
      fileName: `monthly-report-${selected.year}-${String(selected.month).padStart(2, '0')}.xlsx`,
      month: selected.month,
      year: selected.year,
      label: selected.label,
    };
  }

  async findCurrentMonthInvoicesEntities() {
    const jakartaTimeStr = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
    });
    const jakartaDate = new Date(jakartaTimeStr);

    const startOfMonth = new Date(
      jakartaDate.getFullYear(),
      jakartaDate.getMonth(),
      1,
    );

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where('(invoice.createdAt >= :start OR invoice.status = :status)', {
        start: startOfMonth,
        status: InvoiceStatus.UNPAID,
      })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async findUnsentInvoicesForCurrentMonth() {
    const jakartaTimeStr = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
    });
    const jakartaDate = new Date(jakartaTimeStr);

    const startOfMonth = new Date(
      jakartaDate.getFullYear(),
      jakartaDate.getMonth(),
      1,
    );

    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.parent', 'parent')
      .leftJoinAndSelect('parent.user', 'parentUser')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.student', 'student')
      .leftJoinAndSelect('student.user', 'studentUser')
      .leftJoinAndSelect('student.trainingClass', 'trainingClass')
      .where(
        '(invoice.createdAt >= :start OR invoice.status = :unpaidStatus)',
        { start: startOfMonth, unpaidStatus: InvoiceStatus.UNPAID },
      )
      .andWhere('invoice.deliveryStatus = :status', {
        status: 'BELUM_TERKIRIM',
      })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async uploadProof(id: string, photoUrl: string) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    invoice.photo_url = photoUrl;
    return this.invoiceRepository.save(invoice);
  }

  async verifyInvoice(
    id: string,
    adminId: string,
    paymentMethod: 'TRANSFER' | 'CASH',
    paidAmount?: number,
  ) {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (paymentMethod === 'TRANSFER') {
      if (!invoice.photo_url) {
        throw new Error('No payment proof uploaded for transfer');
      }
      if (
        paidAmount &&
        invoice.uniqueAmount &&
        paidAmount !== invoice.uniqueAmount
      ) {
        throw new Error(
          `Amount mismatch. Expected: ${invoice.uniqueAmount}, Received: ${paidAmount}`,
        );
      }
    } else if (paymentMethod === 'CASH') {
      if (paidAmount && paidAmount < invoice.amount) {
        throw new Error(
          `Insufficient amount. Expected at least: ${invoice.amount}, Received: ${paidAmount}`,
        );
      }
    }

    invoice.isVerified = true;
    invoice.verifiedAt = new Date();
    invoice.verifiedBy = adminId;
    invoice.status = InvoiceStatus.PAID;
    invoice.paymentMethod = paymentMethod;

    return this.invoiceRepository.save(invoice);
  }
}
