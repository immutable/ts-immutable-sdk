import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    // Enhanced JavaScript coverage collection settings
    contextOptions: {
      javaScriptEnabled: true
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'NODE_ENV=test NEXT_PUBLIC_INSTRUMENTATION_ENABLED=true PORT=3003 pnpm run build && PORT=3003 pnpm start',
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_INSTRUMENTATION_ENABLED: 'true',
      PORT: '3003'
    }
  },
}); 