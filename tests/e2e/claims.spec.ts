import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  const fixture = await mkdtemp(join(tmpdir(), 'archive-private-'));
  const main = join(fixture, 'main-archive');
  const copy = join(fixture, 'independent-copy');
  await mkdir(main);
  await mkdir(copy);
  await writeFile(join(main, 'notes.txt'), 'family archive');
  await writeFile(join(copy, 'notes.txt'), 'family archive');
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  try {
    await page.goto('/demo');
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await page.getByRole('button', { name: 'Export recovery manifest' }).click();
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(main);
    await page.locator('#backup-input').setInputFiles(copy);
    await page.getByRole('button', { name: 'Check both folders' }).click();
    await page.getByRole('button', { name: 'Export recovery manifest' }).click();
    expect(outsideRequests).toEqual([]);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One archive item needs attention');
});

test('service worker replaces stale pages online and keeps the update offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.evaluate(async () => {
    const cache = await caches.open('family-archive-check-v2');
    await cache.put('/', new Response('<!doctype html><html><body><main><h1>Stale release</h1></main></body></html>', {
      headers: { 'Content-Type': 'text/html' }
    }));
  });

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check every family photo has a copy');
  await expect(page.getByText('Version 0.1.5')).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Version 0.1.5')).toBeVisible();
});

test('@claim:paid-license links to the $29 household checkout', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/family-archive-check/verify?license=test-license', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok' })
  }));
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Buy household license — $29' });
  await expect(link).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/family-archive-check/checkout');
  await expect(page.getByText('Pay $29 once for unlimited checks and saved folder profiles.')).toBeVisible();
  await page.goto('/check');
  await page.getByLabel('Or paste a license token').fill('test-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License active', { exact: true })).toBeVisible();
  await expect(page.getByText('Unlimited checks and saved folder profiles are available.')).toBeVisible();
});

test('@claim:license-privacy sends only the pasted token to Sociobot', async ({ page }) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  await page.route('https://api.sociobot.in/api/v1/products/family-archive-check/verify?license=private-token', async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), method: request.method(), body: request.postData() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/check');
  await page.getByLabel('Or paste a license token').fill('private-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License active', { exact: true })).toBeVisible();
  expect(requests).toEqual([{
    url: 'https://api.sociobot.in/api/v1/products/family-archive-check/verify?license=private-token',
    method: 'GET',
    body: null
  }]);
});

test('empty sampled photos are reported unreadable', async ({ page }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-corrupt-'));
  const main = join(fixture, 'main-archive');
  const copy = join(fixture, 'independent-copy');
  await mkdir(main);
  await mkdir(copy);
  const corruptJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9]);
  await writeFile(join(main, 'corrupt.jpg'), corruptJpeg);
  await writeFile(join(copy, 'corrupt.jpg'), corruptJpeg);
  try {
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(main);
    await page.locator('#backup-input').setInputFiles(copy);
    await page.getByRole('button', { name: 'Check both folders' }).click();
    await expect(page.getByText('1 unreadable file entries')).toBeVisible();
    await expect(page.getByText('Ready for handoff')).toHaveCount(0);
    await expect(page.getByText('corrupt.jpg')).toBeVisible();
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('the same selected folder cannot be checked as its own copy', async ({ page }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-same-folder-'));
  const folder = join(fixture, 'family-archive');
  await mkdir(folder);
  await writeFile(join(folder, 'note.txt'), 'archive note');
  try {
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(folder);
    await page.locator('#backup-input').setInputFiles(folder);
    await expect(page.getByRole('alert')).toContainText('same folder was chosen twice');
    await expect(page.getByRole('button', { name: 'Check both folders' })).toBeDisabled();
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('@claim:demo-isolation demo data never appears in a real check', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toBeVisible();
  await page.getByRole('link', { name: 'Check folders' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check two archive folders');
  await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toHaveCount(0);
});

test('@claim:handoff-sheet opens a printable recovery handoff', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Print handoff sheet' }).click();
  await expect(page).toHaveURL(/\/print\/sample-family-archive$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
});

test('@claim:platform-download links a detected platform to a release asset', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' }));
  await page.route('https://api.github.com/repos/B-Divyesh/sf-family-archive-check/releases?per_page=1', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ tag_name: 'v0.1.1', assets: [{ name: 'Family.Archive.Check_0.1.1_aarch64.dmg', browser_download_url: 'https://example.test/family-archive-check.dmg' }] }])
  }));
  await page.goto('/');
  const download = page.getByRole('link', { name: 'Download for macOS' });
  await expect(download).toHaveAttribute('href', 'https://example.test/family-archive-check.dmg');
  await expect(page.getByText('v0.1.1 is ready. Builds are unsigned until signing certificates are added.')).toBeVisible();
});

test('pages meet the serious accessibility baseline', async ({ page }) => {
  for (const path of ['/', '/demo', '/check', '/privacy', '/terms', '/print/sample-family-archive', '/missing-stop', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
});

test('keyboard navigation skips hidden file inputs and shows focus', async ({ page }) => {
  await page.goto('/check');
  const focusedIds: string[] = [];
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    focusedIds.push(await page.evaluate(() => (document.activeElement as HTMLElement)?.id ?? ''));
  }
  expect(focusedIds).not.toContain('primary-input');
  expect(focusedIds).not.toContain('backup-input');
  const picker = page.getByRole('button', { name: 'Choose and read main folder' });
  await picker.focus();
  expect(await picker.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
});

test('cold-load keyboard order starts with the skip link and route changes announce their heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeFocused();

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Family Archive Check' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Demo', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Check folders', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Privacy', exact: true }).first()).toBeFocused();

  await page.getByRole('link', { name: 'Demo', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One archive item needs attention');

  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check every family photo has a copy');
});

test('check screen keeps its content at 200 percent text size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/check');
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: 'Choose and read backup folder' })).toBeVisible();
});

test('desktop first screen keeps its audience and primary action visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const locator of [page.locator('.hero-copy .lede'), page.getByRole('link', { name: 'Try it with sample data' })]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
  }
});

test('mobile layout keeps actions inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: 'Export recovery manifest' })).toBeVisible();
  await page.goto('/');
  for (const link of await page.locator('.site-footer a').all()) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/check');
  expect((await page.getByRole('link', { name: /Buy household license/ }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.goto('/privacy');
  expect((await page.getByRole('link', { name: 'Return to the home page' }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('unknown routes return 404 and hashed assets are immutable', async ({ page, request }) => {
  const missing = await request.get('/missing-stop');
  expect(missing.status()).toBe(404);
  await page.goto('/');
  const scriptPath = await page.locator('script[src]').getAttribute('src');
  const asset = await request.get(scriptPath!);
  expect(asset.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
});

test('all public routes load without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  for (const path of ['/', '/demo', '/check', '/privacy', '/terms', '/print/sample-family-archive', '/404.html']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  }
  expect(errors).toEqual([]);
});
