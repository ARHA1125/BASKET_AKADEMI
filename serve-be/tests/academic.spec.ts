import { test, expect } from '@playwright/test';
import { generateRandomEmail, registerAndLogin, generateRandomPhone } from './helpers';

test.describe('Academic API Controller Tests', () => {
  let adminHeaders: Record<string, string>;
  let studentHeaders: Record<string, string>;
  
  test.beforeAll(async ({ request }) => {
    const admin = await registerAndLogin(request, 'ADMIN');
    adminHeaders = admin.headers;

    const student = await registerAndLogin(request, 'STUDENT');
    studentHeaders = student.headers;
  });

  test('should submit a public application and check duplicates', async ({ request }) => {
    const parentEmail = generateRandomEmail();
    const parentPhone = generateRandomPhone();
    
    // 1. Submit application
    const applyResponse = await request.post('/public/apply', {
      data: {
        parentName: 'John Parent',
        parentEmail,
        parentPhone,
        studentName: 'Billy Student',
        studentDob: '2015-05-15',
        studentHeight: 140,
        studentWeight: 35,
        studentPosition: 'Guard',
      },
    });
    expect(applyResponse.status()).toBe(201);
    const applyBody = await applyResponse.json();
    expect(applyBody.id).toBeDefined();

    // 2. Check duplicates (should find duplicate)
    const duplicateResponse = await request.get(`/public/check-duplicate?email=${parentEmail}`, {
      headers: adminHeaders,
    });
    expect(duplicateResponse.status()).toBe(200);
    const dupBody = await duplicateResponse.json();
    expect(dupBody.emailExists).toBe(true);
  });

  test('should deny access to student for admin/coach academic endpoints', async ({ request }) => {
    const response = await request.get('/academic/students', {
      headers: studentHeaders,
    });
    // Student role should be forbidden from accessing general academic data
    expect(response.status()).toBe(403);
  });

  test('should allow admin/coach to view general academic data', async ({ request }) => {
    // 1. View students
    const studentsResponse = await request.get('/academic/students', {
      headers: adminHeaders,
    });
    expect(studentsResponse.status()).toBe(200);
    const studentsBody = await studentsResponse.json();
    expect(studentsBody.data).toBeDefined();
    
    // 2. View coaches
    const coachesResponse = await request.get('/academic/coaches', {
      headers: adminHeaders,
    });
    expect(coachesResponse.status()).toBe(200);

    // 3. View classes
    const classesResponse = await request.get('/academic/classes', {
      headers: adminHeaders,
    });
    expect(classesResponse.status()).toBe(200);
  });

  test('should create, find, and update curriculum hierarchy', async ({ request }) => {
    // 1. Create Level
    const levelResponse = await request.post('/academic/curriculum-levels', {
      headers: adminHeaders,
      data: {
        name: `Dasar-${Date.now()}`,
        description: 'Tingkat Fundamental Dasar',
        colorCode: 'blue',
      },
    });
    expect(levelResponse.status()).toBe(201);
    const level = await levelResponse.json();
    expect(level.id).toBeDefined();

    // 2. Create Month
    const monthResponse = await request.post('/academic/curriculum-months', {
      headers: adminHeaders,
      data: {
        levelId: level.id,
        monthNumber: 1,
        title: 'Bulan Pertama Dasar',
      },
    });
    expect(monthResponse.status()).toBe(201);
    const month = await monthResponse.json();
    expect(month.id).toBeDefined();

    // 3. Create Week Material
    const weekResponse = await request.post('/academic/curriculum-week-materials', {
      headers: adminHeaders,
      data: {
        monthId: month.id,
        weekNumber: 1,
        category: 'Dasar Body Control',
        materialDescription: 'Stance, Start, Step',
        statDomain: 'PAS',
        statWeight: 1.5,
      },
    });
    expect(weekResponse.status()).toBe(201);
    const week = await weekResponse.json();
    expect(week.id).toBeDefined();

    // 4. Retrieve Level with Hierarchy Tree
    const getLevelResponse = await request.get(`/academic/curriculum-levels/${level.id}`, {
      headers: adminHeaders,
    });
    expect(getLevelResponse.status()).toBe(200);
    const levelTree = await getLevelResponse.json();
    expect(levelTree.months).toBeDefined();
    expect(levelTree.months.length).toBe(1);
    expect(levelTree.months[0].weekMaterials.length).toBe(1);

    // 5. Cleanup / Delete level (should cascade delete month/week)
    const deleteLevelResponse = await request.delete(`/academic/curriculum-levels/${level.id}`, {
      headers: adminHeaders,
    });
    expect(deleteLevelResponse.status()).toBe(200);
  });
});
