import { test, expect } from '@playwright/test';

test.describe('Multi-Role Gating and Dashboard UAT', () => {

  // Global mock handlers for backend endpoints to prevent E2E database dependency
  test.beforeEach(async ({ page }) => {
    // Mock student performance summary
    await page.route('**/academic/me/performance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          student: {
            id: '1',
            position: 'G',
            ageClass: 'U-16',
            curriculumProfile: 'Dasar',
            user: {
              fullName: 'Budi Santoso',
              email: 'student@example.com',
              photo_url: null
            }
          },
          latestAssessment: null,
          assessments: [],
          recentActivities: [],
          badges: [],
          gamification: {
            categories: [],
            featuredBadge: null,
            totalPoints: 120
          },
          leaderboard: {
            currentRank: 5,
            weeklyPoints: 30,
            totalPlayers: 50
          }
        }),
      });
    });

    // Mock parent children summary
    await page.route('**/academic/me/children/performance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          parent: {
            id: '2',
            user: {
              fullName: 'Siti Aminah',
              email: 'parent@example.com'
            }
          },
          children: [
            {
              student: {
                id: '1',
                position: 'G',
                ageClass: 'U-16',
                curriculumProfile: 'Dasar',
                user: {
                  fullName: 'Budi Santoso',
                  email: 'student@example.com',
                  photo_url: null
                }
              },
              latestAssessment: null,
              assessments: [],
              badges: [],
              gamification: {
                categories: [],
                featuredBadge: null,
                totalPoints: 120
              },
              leaderboard: {
                currentRank: 5,
                weeklyPoints: 30,
                totalPlayers: 50
              }
            }
          ]
        }),
      });
    });
  });
  
  test('should redirect unauthenticated users to login page', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    await expect(page.url()).toContain('/login');
  });

  // 1. ADMIN ROLE TEST
  test('should allow Admin to login and access Admin routes', async ({ page, context }) => {
    // Set authenticated cookies for Admin
    await context.addCookies([
      { name: 'auth_token', value: 'dummy-admin-token', domain: '127.0.0.1', path: '/' },
      { name: 'role', value: 'admin', domain: '127.0.0.1', path: '/' }
    ]);

    await page.goto('/');
    
    // Admins remain on / root or redirect to admin panel
    await page.goto('/admin');
    await page.waitForURL('**/admin');
    await expect(page.url()).toContain('/admin');
    
    // Verify admin dashboard sidebar is visible.
    // In our codebase, the Sidebar renders a div with data-sidebar="sidebar"
    const sidebar = page.locator('[data-sidebar="sidebar"], aside');
    await expect(sidebar).toBeVisible();
  });

  // 2. STUDENT ROLE TEST
  test('should redirect Student to /student path and show student portal', async ({ page, context }) => {
    // Set authenticated cookies for Student
    await context.addCookies([
      { name: 'auth_token', value: 'dummy-student-token', domain: '127.0.0.1', path: '/' },
      { name: 'role', value: 'student', domain: '127.0.0.1', path: '/' }
    ]);

    await page.goto('/');
    await page.waitForURL('**/student');
    await expect(page.url()).toContain('/student');

    // Verify student-specific layouts (like main layout wrapper)
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify welcome message renders student name from mock
    await expect(page.locator('text=Budi Santoso')).toBeVisible();
  });

  // 3. PARENT ROLE TEST
  test('should redirect Parent to /parent path and show parent portal', async ({ page, context }) => {
    // Set authenticated cookies for Parent
    await context.addCookies([
      { name: 'auth_token', value: 'dummy-parent-token', domain: '127.0.0.1', path: '/' },
      { name: 'role', value: 'parent', domain: '127.0.0.1', path: '/' }
    ]);

    await page.goto('/');
    await page.waitForURL('**/parent');
    await expect(page.url()).toContain('/parent');

    // Verify parent layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify that Sit Aminah (from mock data) or child details exist
    await expect(page.locator('text=Budi Santoso')).toBeVisible();
  });

  // 4. COACH ROLE TEST
  test('should redirect Coach to /coach path and show coach portal', async ({ page, context }) => {
    // Set authenticated cookies for Coach
    await context.addCookies([
      { name: 'auth_token', value: 'dummy-coach-token', domain: '127.0.0.1', path: '/' },
      { name: 'role', value: 'coach', domain: '127.0.0.1', path: '/' }
    ]);

    await page.goto('/');
    await page.waitForURL('**/coach');
    await expect(page.url()).toContain('/coach');

    // Verify coach layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Verify Dashboard Overview content is visible
    await expect(page.locator('text=Dashboard Overview')).toBeVisible();
  });

  // GATING SECURITY TEST
  test('should block non-admins from /admin and return 404', async ({ page, context }) => {
    // Set authenticated cookies for Student attempting to access /admin
    await context.addCookies([
      { name: 'auth_token', value: 'dummy-student-token', domain: '127.0.0.1', path: '/' },
      { name: 'role', value: 'student', domain: '127.0.0.1', path: '/' }
    ]);

    await page.goto('/admin');
    // Middleware rewrites to 404
    await expect(page.locator('text=404')).toBeVisible();
  });
});
