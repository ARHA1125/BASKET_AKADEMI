import { APIRequestContext } from '@playwright/test';

export function generateRandomEmail(): string {
  return `test-user-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

export function generateRandomPhone(): string {
  return `0812${Math.floor(10000000 + Math.random() * 90000000)}`;
}

export async function registerAndLogin(
  request: APIRequestContext,
  role: 'ADMIN' | 'COACH' | 'STUDENT' | 'PARENT',
  customEmail?: string
) {
  const email = customEmail || generateRandomEmail();
  const password = 'testpassword123';
  const fullName = `Test ${role} User`;
  const phoneNumber = generateRandomPhone();

  // 1. Register the user
  const registerResponse = await request.post('/auth/register', {
    data: {
      email,
      password,
      role,
      fullName,
      phoneNumber,
    },
  });

  if (registerResponse.status() !== 201) {
    const errorBody = await registerResponse.text();
    throw new Error(`Failed to register user (${registerResponse.status()}): ${errorBody}`);
  }

  const registerUser = await registerResponse.json();

  // 2. Login the user
  const loginResponse = await request.post('/auth/login', {
    data: {
      email,
      password,
    },
  });

  if (loginResponse.status() !== 200) {
    const errorBody = await loginResponse.text();
    throw new Error(`Failed to login user (${loginResponse.status()}): ${errorBody}`);
  }

  const { accessToken } = await loginResponse.json();

  return {
    token: accessToken,
    email,
    password,
    userId: registerUser.id,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
}

export async function createParentAndLogin(request: APIRequestContext, adminHeaders: Record<string, string>) {
  const email = generateRandomEmail();
  const password = 'password123';
  const fullName = 'Unified Parent Test';
  const phoneNumber = generateRandomPhone();

  // Create unified parent (requires ADMIN headers)
  const createRes = await request.post('/academic/unified/parents', {
    headers: adminHeaders,
    data: {
      email,
      password,
      fullName,
      phoneNumber,
    },
  });

  if (createRes.status() !== 201) {
    const errText = await createRes.text();
    throw new Error(`Failed to create unified parent: ${errText}`);
  }

  // Log in as the new parent
  const loginRes = await request.post('/auth/login', {
    data: { email, password },
  });
  const { accessToken } = await loginRes.json();

  return {
    token: accessToken,
    email,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
}

export async function createStudentAndLogin(request: APIRequestContext, adminHeaders: Record<string, string>) {
  const email = generateRandomEmail();
  const password = 'password123';
  const fullName = 'Unified Student Test';
  const phoneNumber = generateRandomPhone();

  // Create unified student (requires ADMIN headers)
  const createRes = await request.post('/academic/unified/students', {
    headers: adminHeaders,
    data: {
      email,
      password,
      fullName,
      phoneNumber,
      ageClass: 'KU-10',
    },
  });

  if (createRes.status() !== 201) {
    const errText = await createRes.text();
    throw new Error(`Failed to create unified student: ${errText}`);
  }

  const created = await createRes.json();

  // Log in as the new student
  const loginRes = await request.post('/auth/login', {
    data: { email, password },
  });
  const { accessToken } = await loginRes.json();

  return {
    token: accessToken,
    email,
    userId: created.user?.id || created.id,
    studentId: created.id,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
}

