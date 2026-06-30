import { test, expect } from '@playwright/test';
import { generateRandomEmail, registerAndLogin } from './helpers';

test.describe('Auths & Users API Controller Tests', () => {
  let userEmail: string;
  let userHeaders: Record<string, string>;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    // Register and login a standard Student user for testing profile operations
    const user = await registerAndLogin(request, 'STUDENT');
    userEmail = user.email;
    userHeaders = user.headers;
    userId = user.userId;
  });

  test('should handle valid and duplicate user registration', async ({ request }) => {
    const email = generateRandomEmail();
    
    // 1. Success case
    const registerResponse = await request.post('/auth/register', {
      data: {
        email,
        password: 'password123',
        role: 'STUDENT',
        fullName: 'Jane Doe',
        phoneNumber: '08123456789',
      },
    });
    expect(registerResponse.status()).toBe(201);
    const body = await registerResponse.json();
    expect(body.email).toBe(email);
    expect(body.fullName).toBe('Jane Doe');

    // 2. Conflict case (duplicate email)
    const duplicateResponse = await request.post('/auth/register', {
      data: {
        email,
        password: 'password123',
        role: 'STUDENT',
        fullName: 'Duplicate User',
        phoneNumber: '08123456789',
      },
    });
    expect(duplicateResponse.status()).toBe(409);
  });

  test('should fail login with invalid password', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: {
        email: userEmail,
        password: 'incorrect-password',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('should fetch current user profile GET /auth/me', async ({ request }) => {
    const response = await request.get('/auth/me', {
      headers: userHeaders,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.email).toBe(userEmail);
    expect(body.role).toBe('STUDENT');
  });

  test('should patch current user profile PATCH /auth/profile', async ({ request }) => {
    const newName = 'Updated Name Jane';
    const response = await request.patch('/auth/profile', {
      headers: userHeaders,
      data: {
        fullName: newName,
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.fullName).toBe(newName);
  });

  test('should change user password and login with new password', async ({ request }) => {
    // 1. Change password
    const response = await request.post('/auth/profile/password', {
      headers: userHeaders,
      data: {
        oldPassword: 'testpassword123',
        newPassword: 'newpassword123',
      },
    });
    expect(response.status()).toBe(200);

    // 2. Try logging in with old password (should fail)
    const oldLogin = await request.post('/auth/login', {
      data: {
        email: userEmail,
        password: 'testpassword123',
      },
    });
    expect(oldLogin.status()).toBe(401);

    // 3. Login with new password (should succeed)
    const newLogin = await request.post('/auth/login', {
      data: {
        email: userEmail,
        password: 'newpassword123',
      },
    });
    expect(newLogin.status()).toBe(200);
    const loginBody = await newLogin.json();
    expect(loginBody.accessToken).toBeDefined();

    // Re-authenticate userHeaders for subsequent runs/tests if needed
    userHeaders = {
      ...userHeaders,
      'Authorization': `Bearer ${loginBody.accessToken}`,
    };
  });

  test('should list all users and verify pagination GET /users', async ({ request }) => {
    const response = await request.get('/users?page=1&limit=5', {
      headers: userHeaders,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(5);
  });

  test('should update a user record PATCH /users/:id', async ({ request }) => {
    const response = await request.patch(`/users/${userId}`, {
      headers: userHeaders,
      data: {
        fullName: 'Admin Updated User Name',
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.fullName).toBe('Admin Updated User Name');
  });
});
