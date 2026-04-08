import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  globalSetup: "../../packages/e2e/global-setup.ts",
  testDir: "../../packages/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "https://next.ada.localhost",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm run dev",
    url: "https://next.ada.localhost",
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
  },
});
