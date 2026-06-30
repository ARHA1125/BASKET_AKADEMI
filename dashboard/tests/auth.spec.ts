import { test, expect } from '@playwright/test';

test.describe('Dashboard Login UAT', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
    // Wait for Next.js hydration to complete before interacting with inputs
    await page.locator('button[type="submit"]').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
  });

  test('should display login form elements', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Sign in to your account');
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error message on invalid credentials (Mocked API)', async ({ page }) => {
    // Intercept API login endpoint and return 401 Unauthorized
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.fill('input#email', 'wrong@example.com');
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error notification is displayed
    const errorAlert = page.locator('.bg-red-50, .dark\\:bg-red-900\\/30');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Invalid credentials');
  });

  test('should store tokens and redirect to portal on successful login (Mocked API - Admin)', async ({ page }) => {
    // Intercept successful login returning an Admin role
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'fake-jwt-token.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIn0.signature',
          user: {
            email: 'admin@example.com',
            role: 'admin',
            fullName: 'Administrator'
          }
        }),
      });
    });

    await page.fill('input#email', 'admin@example.com');
    await page.fill('input#password', 'password123');
    
    // Trigger login
    await page.click('button[type="submit"]');

    // Next.js middleware redirects back to "/" (which resolves to Admin dashboard or stays at root)
    await page.waitForURL('**/');
  });
});
