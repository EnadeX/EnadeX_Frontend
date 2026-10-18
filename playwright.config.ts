import { defineConfig, devices } from '@playwright/test'

const PORTA = Number(process.env.E2E_PORT ?? 3100)

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORTA}` },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  webServer: {
    command: `pnpm dev --port ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-claro', use: { ...devices['Desktop Chrome'], colorScheme: 'light' } },
    { name: 'desktop-escuro', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
    { name: 'celular', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, colorScheme: 'light' } },
  ],
})
