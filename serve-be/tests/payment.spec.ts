import { test, expect } from '@playwright/test';
import { registerAndLogin, createParentAndLogin } from './helpers';

test.describe('Payment API Controller Tests', () => {
  let adminHeaders: Record<string, string>;
  let parentHeaders: Record<string, string>;

  test.beforeAll(async ({ request }) => {
    const admin = await registerAndLogin(request, 'ADMIN');
    adminHeaders = admin.headers;

    const parent = await createParentAndLogin(request, admin.headers);
    parentHeaders = parent.headers;
  });

  test('should retrieve payment module overview dashboard data', async ({ request }) => {
    const response = await request.get('/payment-module/overview?month=6&year=2026', {
      headers: adminHeaders,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.totalRevenue).toBeDefined();
    expect(body.targetRevenue).toBeDefined();
    expect(body.agingAR).toBeDefined();
    expect(body.agingStudents).toBeDefined();
  });

  test('should retrieve invoices history lists', async ({ request }) => {
    const response = await request.get('/payment-module/invoices?filter=history&month=6&year=2026', {
      headers: adminHeaders,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should retrieve parent-specific invoice list', async ({ request }) => {
    const response = await request.get('/payment-module/parent/me?month=6&year=2026', {
      headers: parentHeaders,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should manage invoice generation scheduling configurations', async ({ request }) => {
    // 1. Get schedule
    const getSchedule = await request.get('/payment-module/schedule', {
      headers: adminHeaders,
    });
    expect(getSchedule.status()).toBe(200);
    const schedule = await getSchedule.json();
    expect(schedule.day).toBeDefined();
    expect(schedule.time).toBeDefined();

    // 2. Set schedule
    const setSchedule = await request.post('/payment-module/schedule', {
      headers: adminHeaders,
      data: {
        day: 5,
        time: '10:00',
      },
    });
    expect(setSchedule.status()).toBe(201);
  });

  test('should manage reminder email schedules', async ({ request }) => {
    // 1. Get reminder schedule
    const getReminder = await request.get('/payment-module/reminder-schedule', {
      headers: adminHeaders,
    });
    expect(getReminder.status()).toBe(200);

    // 2. Set reminder schedule
    const setReminder = await request.post('/payment-module/reminder-schedule', {
      headers: adminHeaders,
      data: {
        day: 10,
        time: '14:30',
      },
    });
    expect(setReminder.status()).toBe(201);
  });

  test('should manage manual late invoice schedule configuration', async ({ request }) => {
    // 1. Get manual late schedule
    const getLate = await request.get('/payment-module/manual-late-schedule', {
      headers: adminHeaders,
    });
    expect(getLate.status()).toBe(200);

    // 2. Set manual late schedule
    const setLate = await request.post('/payment-module/manual-late-schedule', {
      headers: adminHeaders,
      data: {
        isActive: true,
        targetMonth: 6,
        targetYear: 2026,
        executionDay: 15,
        executionTime: '08:00',
      },
    });
    expect(setLate.status()).toBe(201);
  });

  test('should trigger manual invoice generation', async ({ request }) => {
    const response = await request.post('/payment-module/generate-now', {
      headers: adminHeaders,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
