import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

test.describe('Community Module API Tests', () => {
  let adminHeaders: Record<string, string>;
  let eventId: string;
  let squadId: string;
  let studentId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await registerAndLogin(request, 'ADMIN');
    adminHeaders = admin.headers;

    // Retrieve or create a student ID to populate squad players list
    const listRes = await request.get('/academic/students', { headers: adminHeaders });
    expect(listRes.status()).toBe(200);
    const body = await listRes.json();
    if (body.data && body.data.length > 0) {
      studentId = body.data[0].id;
    } else {
      const createRes = await request.post('/academic/unified/students', {
        headers: adminHeaders,
        data: {
          email: `squad-student-${Date.now()}@example.com`,
          password: 'password123',
          fullName: 'Squad Player One',
          ageClass: 'KU-10',
        },
      });
      expect(createRes.status()).toBe(201);
      const created = await createRes.json();
      studentId = created.studentProfile?.id || created.id;
    }
  });

  test('should create, list and find events', async ({ request }) => {
    // 1. Create event
    const createRes = await request.post('/community-module/events', {
      headers: adminHeaders,
      data: {
        name: `Turnamen Wira Bhakti-${Date.now()}`,
        type: 'TOURNAMENT',
        date: '2026-07-01T10:00:00Z',
        location: 'GOR Basket Sahabat',
        description: 'Championship tournament for youth groups',
      },
    });
    expect(createRes.status()).toBe(201);
    const event = await createRes.json();
    expect(event.id).toBeDefined();
    eventId = event.id;

    // 2. Fetch events
    const listRes = await request.get('/community-module/events', {
      headers: adminHeaders,
    });
    expect(listRes.status()).toBe(200);
    const events = await listRes.json();
    expect(Array.isArray(events)).toBe(true);
    expect(events.some((e) => e.id === eventId)).toBe(true);
  });

  test('should manage squads for events', async ({ request }) => {
    // Skip squad tests if studentId could not be generated/fetched
    if (!studentId) {
      console.warn('Skipping squad tests as studentId is undefined');
      return;
    }

    // 1. Create Squad
    const createRes = await request.post('/community-module/squads', {
      headers: adminHeaders,
      data: {
        name: `Wira Bhakti KU-10 Team-${Date.now()}`,
        eventId,
        playerIds: [studentId],
        coachName: 'Coach John Doe',
        isFinalized: false,
      },
    });
    expect(createRes.status()).toBe(201);
    const squad = await createRes.json();
    expect(squad.id).toBeDefined();
    squadId = squad.id;

    // 2. Find All Squads
    const listRes = await request.get('/community-module/squads', {
      headers: adminHeaders,
    });
    expect(listRes.status()).toBe(200);
    const squads = await listRes.json();
    expect(Array.isArray(squads)).toBe(true);

    // 3. Find One Squad
    const getSquadRes = await request.get(`/community-module/squads/${squadId}`, {
      headers: adminHeaders,
    });
    expect(getSquadRes.status()).toBe(200);

    // 4. Finalize Squad
    const finalizeRes = await request.post('/community-module/squads/finalize', {
      headers: adminHeaders,
      data: {
        squadId,
        isFinalized: true,
        awardedBy: 'Chief Admin',
      },
    });
    expect(finalizeRes.status()).toBe(201);
  });
});
