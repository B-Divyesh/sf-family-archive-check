import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function contrastRatio(foreground: string, background: string) {
  const luminance = (value: string) => {
    const channels = value.match(/\d+(?:\.\d+)?/g)!.slice(0, 3).map(Number).map((channel) => channel / 255);
    const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}

test('@claim:demo-ready opens a finished sample check in one click', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('The main archive has six items. The independent copy has five.')).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('One archive item needs attention');
  await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toBeVisible();
  await expect(page.getByRole('heading', { name: '6 files' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '5 files' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in|log in|create account/i })).toHaveCount(0);
  await expect(page.getByLabel(/email|password/i)).toHaveCount(0);
  expect((await page.context().cookies()).filter((cookie) => /auth|session|account/i.test(cookie.name))).toEqual([]);
});

test('@claim:file-list-export exports the recovery file list', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export recovery file list' }).click();
  const result = await download;
  expect(result.suggestedFilename()).toBe('family-archive-file-list-2026-08-28.json');
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
    const demoDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export recovery file list' }).click();
    await demoDownload;
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(main);
    await page.locator('#backup-input').setInputFiles(copy);
    await page.getByRole('button', { name: 'Check both folders' }).click();
    const realDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export recovery file list' }).click();
    await realDownload;
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check every family photo and video has a copy');
  await expect(page.getByText('Version 0.1.9')).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Version 0.1.9')).toBeVisible();
});

test.describe('native license flow', () => {
  // This test simulates a Tauri window inside a static-site browser. Its deployed
  // CSP is intentionally different from the native Tauri CSP, which permits the
  // product verification endpoint.
  test.use({ bypassCSP: true });

test('@claim:paid-license unlocks a 501-file check and a reusable saved profile', async ({ page }) => {
  const files = Array.from({ length: 501 }, (_, index) => ({
    relativePath: `archive/file-${String(index).padStart(3, '0')}.txt`,
    size: 12,
    modified: 1_788_000_000_000 + index,
    kind: 'other',
    readable: true,
    sampled: false
  }));
  const scan = (path: string, label: string, storageId: string) => ({
    path, label, storageId, fileSystem: 'Test volume', files,
    startedAt: '2026-08-29T10:00:00.000Z', completedAt: '2026-08-29T10:00:01.000Z'
  });
  await page.addInitScript(({ main, backup }) => {
    let folderChoice = 0;
    Object.assign(window, {
      __TAURI_INTERNALS__: {
        invoke: async (command: string, args: { path?: string }) => {
          if (command === 'plugin:dialog|open') return folderChoice++ % 2 === 0 ? main.path : backup.path;
          if (command === 'scan_folder') return args.path === main.path ? main : backup;
          throw new Error(`Unexpected native command: ${command}`);
        }
      }
    });
  }, { main: scan('/Volumes/Family Archive', 'Main archive', 'device:main'), backup: scan('/Volumes/Blue Backup', 'Independent copy', 'device:backup') });
  let verificationUrl = '';
  await page.route((url) => url.pathname === '/api/license/verify', (route) => {
    verificationUrl = route.request().url();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ valid: true, reason: 'ok' })
    });
  });
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Buy household license — $29' });
  await expect(link).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/family-archive-check/checkout');
  await expect(page.getByText('Pay $29 once for unlimited checks and saved folder profiles.')).toBeVisible();
  await page.goto('/check');
  await page.getByRole('button', { name: 'Choose and read main archive' }).click();
  await page.getByRole('button', { name: 'Choose and read backup folder' }).click();
  let limitMessage = '';
  page.once('dialog', async (dialog) => { limitMessage = dialog.message(); await dialog.dismiss(); });
  await page.getByRole('button', { name: 'Check both folders' }).click();
  expect(limitMessage).toContain('more than 500 files');
  await page.getByLabel('Or paste a license token').fill('test-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License active', { exact: true })).toBeVisible();
  expect(verificationUrl).toBe('https://family-archive-check.sociobot.in/api/license/verify?license=test-license');
  await expect(page.getByText('Unlimited checks and saved folder profiles are available.')).toBeVisible();
  await page.getByRole('button', { name: 'Check both folders' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Both archive copies are ready');
  await expect(page.getByRole('heading', { name: '501 files' })).toHaveCount(2);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Save folder profile' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Read this profile' }).click();
  await expect(page.locator('#primary-path')).toHaveText('/Volumes/Family Archive');
  await expect(page.locator('#backup-path')).toHaveText('/Volumes/Blue Backup');
  await expect(page.getByRole('button', { name: 'Check both folders' })).toBeEnabled();
});

});

test('@claim:payment-policy checkout identifies Dodo as payment and order-question handler', async ({ request }) => {
  const response = await request.get('https://api.sociobot.in/api/v1/products/family-archive-check/checkout');
  expect(response.url()).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
  const body = await response.text();
  expect(body).toContain('Merchant of Record, dodopayments.com');
  expect(body).toContain('handles order-related inquiries');
});

test('the browser sends a pasted license only to the product verification proxy', async ({ page }) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  await page.route('http://127.0.0.1:4173/api/license/verify?license=private-token', async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), method: request.method(), body: request.postData() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/check');
  await page.getByLabel('Or paste a license token').fill('private-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License active', { exact: true })).toBeVisible();
  expect(requests).toEqual([{
    url: 'http://127.0.0.1:4173/api/license/verify?license=private-token',
    method: 'GET',
    body: null
  }]);
});

test('the license screen explains when the product verifier throttles repeated attempts', async ({ page }) => {
  await page.route('http://127.0.0.1:4173/api/license/verify?license=busy-token', (route) => route.fulfill({
    status: 429,
    headers: { 'Retry-After': '42' },
    contentType: 'application/json',
    body: JSON.stringify({ valid: false, reason: 'rate_limited', retry_after_seconds: 42 })
  }));
  await page.goto('/check');
  await page.getByLabel('Or paste a license token').fill('busy-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('Too many license checks from this connection. Try again in 42 seconds.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:family-archive-check'))).toBeNull();
});

test('@claim:no-tracking loads no trackers or third-party fonts and scripts', async ({ page }) => {
  const outsideRequests = new Set<string>();
  page.on('request', (request) => {
    const origin = new URL(request.url()).origin;
    if (origin !== 'http://127.0.0.1:4173') outsideRequests.add(origin);
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect([...outsideRequests]).toEqual(['https://api.github.com']);
  expect(await page.locator('script[src^="http"], link[rel="stylesheet"][href^="http"]').count()).toBe(0);
  expect((await page.context().cookies()).filter((cookie) => cookie.domain.includes('127.0.0.1'))).toEqual([]);
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

test('a one-file match uses singular result copy', async ({ page }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-singular-result-'));
  const main = join(fixture, 'main-archive');
  const copy = join(fixture, 'independent-copy');
  await mkdir(main);
  await mkdir(copy);
  await writeFile(join(main, 'family-note.txt'), 'same note');
  await writeFile(join(copy, 'family-note.txt'), 'same note');
  try {
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(main);
    await page.locator('#backup-input').setInputFiles(copy);
    await page.getByRole('button', { name: 'Check both folders' }).click();
    await expect(page.getByText('1 path match across both folders.')).toBeVisible();
    await expect(page.getByText('1 paths match across both folders.')).toHaveCount(0);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('@claim:demo-isolation demo data never appears in a real check', async ({ page }) => {
  await page.goto('/check');
  const before = await page.evaluate(() => {
    localStorage.setItem('family-archive-check:profiles', JSON.stringify([{ main: '/Real/Main', backup: '/Real/Copy', savedAt: '2026-08-29T00:00:00.000Z' }]));
    localStorage.setItem('family-archive-check:sentinel', 'real-data-must-not-change');
    return Object.fromEntries(Object.entries(localStorage).sort(([left], [right]) => left.localeCompare(right)));
  });
  await page.goto('/?demo=1');
  await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export recovery file list' }).click();
  await download;
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check two archive folders');
  await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toHaveCount(0);
  const after = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).sort(([left], [right]) => left.localeCompare(right))));
  expect(after).toEqual(before);
  expect(Object.keys(after).filter((key) => key.startsWith('demo:'))).toEqual([]);
});

test('@claim:handoff-sheet opens a printable recovery handoff', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Print handoff sheet' }).click();
  await expect(page).toHaveURL(/\/print\/sample-family-archive$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How to recover this family archive');
  await expect(page.locator('.print-sheet > ol > li')).toHaveCount(4);
  await expect(page.getByRole('definition').filter({ hasText: '/Volumes/Family Photos' })).toBeVisible();
  await expect(page.getByRole('definition').filter({ hasText: '/Volumes/Blue Backup' })).toBeVisible();
  await expect(page.getByText('5 matching paths. 1 item needs review.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print this sheet' })).toBeVisible();
});

test('a real handoff stays inside the check route and unknown print paths are real 404s', async ({ page, request }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-handoff-route-'));
  const main = join(fixture, 'main-archive');
  const copy = join(fixture, 'independent-copy');
  await mkdir(main);
  await mkdir(copy);
  await writeFile(join(main, 'family-note.txt'), 'original');
  await writeFile(join(copy, 'family-note.txt'), 'copy');
  try {
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(main);
    await page.locator('#backup-input').setInputFiles(copy);
    await page.getByRole('button', { name: 'Check both folders' }).click();
    await page.getByRole('button', { name: 'Preview handoff sheet' }).click();
    await expect(page).toHaveURL(/\/check$/);
    await expect(page).toHaveTitle('Check folders — Family Archive Check');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('How to recover this family archive');
    await page.getByRole('button', { name: 'Return to results' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('One archive item needs attention');
    const unknown = await request.get('/print/not-a-real-check');
    expect(unknown.status()).toBe(404);
    expect(await unknown.text()).toContain('This page was not found');
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('a multi-item result names the true issue count in its heading and status', async ({ page }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-multi-issue-'));
  const main = join(fixture, 'main-archive');
  const copy = join(fixture, 'independent-copy');
  await mkdir(main);
  await mkdir(copy);
  await writeFile(join(main, 'first.txt'), 'first');
  await writeFile(join(main, 'second.txt'), 'second');
  await writeFile(join(copy, 'keep.txt'), 'keep');
  try {
    await page.goto('/check');
    await page.locator('#primary-input').setInputFiles(main);
    await page.locator('#backup-input').setInputFiles(copy);
    await page.getByRole('button', { name: 'Check both folders' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('2 archive items need attention');
    await expect(page.locator('.verdict[role="status"]')).toContainText('2 items need attention');
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
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
  await expect(page.getByText('v0.1.1 is ready. Choose the installer for this device.')).toBeVisible();
});

test('@claim:recovery-import imports a recovery file list and checks a restored folder', async ({ page }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-restored-'));
  const restored = join(fixture, 'restored-family');
  const datedFolder = join(restored, '1987', '08-Lake-camping');
  await mkdir(datedFolder, { recursive: true });
  await writeFile(join(datedFolder, 'Dad-by-the-tent.jpg'), new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0xff, 0xd9]));
  try {
    await page.goto('/demo');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export recovery file list' }).click();
    const manifest = await download;
    await page.getByRole('button', { name: 'Start for real' }).click();
    await page.locator('#import-recovery-file').click();
    await page.locator('#recovery-file-input').setInputFiles((await manifest.path())!);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check a restored folder');
    await page.locator('#restored-input').setInputFiles(restored);
    await page.getByRole('button', { name: 'Check restored folder' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('6 archive items need attention');
    await expect(page.getByText('1987/08-Lake-camping/Dad-by-the-tent.jpg')).toBeVisible();
    await expect(page.getByText('2024/01-New-year/fireworks.mp4')).toBeVisible();
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('@claim:recovery-import-private keeps the recovery comparison on this device', async ({ page }) => {
  const fixture = await mkdtemp(join(tmpdir(), 'archive-restored-private-'));
  const restored = join(fixture, 'restored-family');
  await mkdir(restored);
  await writeFile(join(restored, 'note.txt'), 'restored locally');
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  try {
    await page.goto('/demo');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export recovery file list' }).click();
    const manifest = await download;
    await page.getByRole('button', { name: 'Start for real' }).click();
    await page.locator('#import-recovery-file').click();
    await page.locator('#recovery-file-input').setInputFiles((await manifest.path())!);
    await page.locator('#restored-input').setInputFiles(restored);
    await page.getByRole('button', { name: 'Check restored folder' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('archive items need attention');
    expect(outsideRequests).toEqual([]);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('@claim:free-exports keeps both recovery exports available without a license', async ({ page }) => {
  await page.goto('/demo');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:family-archive-check'))).toBeNull();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export recovery file list' }).click();
  expect((await download).suggestedFilename()).toBe('family-archive-file-list-2026-08-28.json');
  await page.getByRole('button', { name: 'Print handoff sheet' }).click();
  await expect(page.getByRole('button', { name: 'Print this sheet' })).toBeVisible();
});

test('@claim:accessibility-not-gated keeps keyboard and screen-reader support available without a license', async ({ page }) => {
  await page.goto('/check');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:family-archive-check'))).toBeNull();
  await page.getByRole('button', { name: 'Choose and read main archive' }).focus();
  await expect(page.getByRole('button', { name: 'Choose and read main archive' })).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
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
  const picker = page.getByRole('button', { name: 'Choose and read main archive' });
  await picker.focus();
  expect(await picker.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
});

test('focus indicators have at least 3 to 1 contrast on paper and ink surfaces', async ({ page }) => {
  await page.goto('/privacy');
  const paperLink = page.getByRole('link', { name: 'Return to the home page' });
  await paperLink.focus();
  const paperOutline = await paperLink.evaluate((element) => getComputedStyle(element).outlineColor);
  expect(contrastRatio(paperOutline, 'rgb(244, 235, 216)')).toBeGreaterThanOrEqual(3);

  await page.goto('/');
  const inkLink = page.getByRole('link', { name: 'Demo', exact: true });
  await inkLink.focus();
  const inkOutline = await inkLink.evaluate((element) => getComputedStyle(element).outlineColor);
  expect(contrastRatio(inkOutline, 'rgb(23, 42, 42)')).toBeGreaterThanOrEqual(3);

  await page.goto('/404.html');
  const standaloneInkLink = page.getByRole('link', { name: 'Demo', exact: true });
  await standaloneInkLink.focus();
  const standaloneOutline = await standaloneInkLink.evaluate((element) => getComputedStyle(element).outlineColor);
  expect(contrastRatio(standaloneOutline, 'rgb(23, 42, 42)')).toBeGreaterThanOrEqual(3);
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Check every family photo and video has a copy');
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
  for (const locator of [page.locator('.hero-copy .lede'), page.getByRole('link', { name: 'Try it with sample data' }), page.locator('.plain-facts').getByText('Household license: $29 once.')]) {
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
  await expect(page.getByRole('button', { name: 'Export recovery file list' })).toBeVisible();
  await page.goto('/');
  const priceFact = await page.locator('.plain-facts').getByText('Household license: $29 once.').boundingBox();
  expect(priceFact).not.toBeNull();
  expect(priceFact!.y + priceFact!.height).toBeLessThanOrEqual(844);
  await page.goto('/check');
  expect((await page.getByRole('link', { name: /Buy household license/ }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.goto('/privacy');
  expect((await page.getByRole('link', { name: 'Return to the home page' }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

test('footer links are at least 44 by 44 CSS pixels on every public route', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/check', '/privacy', '/terms', '/print/sample-family-archive', '/missing-stop', '/404.html']) {
    await page.goto(route);
    for (const link of await page.locator('.site-footer a').all()) {
      const box = await link.boundingBox();
      expect(box, `${route} footer link has no box`).not.toBeNull();
      expect(box!.width, `${route} footer link is too narrow`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${route} footer link is too short`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('every public route publishes its own title, description, canonical, and social metadata', async ({ page }) => {
  const routes = [
    ['/', 'Family Archive Check — Check photo backup copies', 'https://family-archive-check.sociobot.in/'],
    ['/demo', 'Demo — Family Archive Check', 'https://family-archive-check.sociobot.in/demo'],
    ['/check', 'Check folders — Family Archive Check', 'https://family-archive-check.sociobot.in/check'],
    ['/privacy', 'Privacy — Family Archive Check', 'https://family-archive-check.sociobot.in/privacy'],
    ['/terms', 'Terms — Family Archive Check', 'https://family-archive-check.sociobot.in/terms'],
    ['/print/sample-family-archive', 'Sample recovery sheet — Family Archive Check', 'https://family-archive-check.sociobot.in/print/sample-family-archive']
  ];
  for (const [path, title, canonical] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
  }
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
