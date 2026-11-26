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
    baseURL: "http://127.0.0.1:4311",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "vite dev --host 127.0.0.1 --port 4311 --strictPort",
    url: "http://127.0.0.1:4311",
  },
});
