import { defineConfig, devices } from "@playwright/test"
import { env } from "./src/config.js"

export default defineConfig({
  tag: "@regression",
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: Number(process.env.TEST_WORKERS || 2),
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: process.env.CG_HTML_DIR || "playwright-report",
        open: "never",
      },
    ],
    [
      "json",
      { outputFile: process.env.CG_JSON_REPORT || "test-results/results.json" },
    ],
    [
      "junit",
      { outputFile: process.env.CG_JUNIT_REPORT || "test-results/junit.xml" },
    ],
  ],
  outputDir: process.env.CG_OUTPUT_DIR || "test-results/artifacts",
  use: {
    baseURL: env.BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-GB",
  },
  projects: [
    { name: "api", testMatch: "**/api/**/*.spec.ts" },
    {
      name: "integration",
      testMatch: "**/integration/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      testMatch: "**/ui/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testMatch: "**/ui/**/*.spec.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: "**/ui/**/*.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chromium",
      testMatch: "**/ui/**/*.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
  ],
})
