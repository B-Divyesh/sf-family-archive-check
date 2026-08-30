import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    trace: 'retain-on-failure'
  },
  webServer: {
    // Always build and start a server owned by this run. The command clears only
    // an orphaned Vite/serve-site process from this workspace before it starts.
    command: 'npm run clean:test-server && npm run build:site && exec node tests/serve-site.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000
  }
});
