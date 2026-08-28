import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:demo-ready opens a finished sample check', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One archive item needs attention');
  await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:manifest-export exports the recovery manifest', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export recovery manifest' }).click();
  const result = await download;
  expect(result.suggestedFilename()).toBe('family-archive-manifest-2026-08-28.json');
  const stream = await result.createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  const manifest = JSON.parse(content);
  expect(manifest.checkId).toBe('sample-family-archive');
  expect(manifest.missingFromBackup).toEqual(['2024/01-New-year/fireworks.mp4']);
});

test('@claim:local-only sends no demo data off site', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: 'Export recovery manifest' }).click();
  expect(outsideRequests).toEqual([]);
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One archive item needs attention');
});

test('@claim:paid-license links to the $29 household checkout', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Buy household license — $29' });
  await expect(link).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/family-archive-check/checkout');
  await expect(page.getByText('Pay $29 once for unlimited checks and saved folder profiles.')).toBeVisible();
});

test('pages meet the serious accessibility baseline', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-stop']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('mobile layout keeps actions inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: 'Export recovery manifest' })).toBeVisible();
});

test('all public routes load without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const path of ['/', '/demo', '/check', '/privacy', '/terms', '/missing-stop']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  expect(errors).toEqual([]);
});
