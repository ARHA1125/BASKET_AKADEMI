import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 30000,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3005',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
});
