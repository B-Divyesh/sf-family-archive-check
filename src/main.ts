import './styles.css';
import { compareScans, exceedsFreeLimit, exportName, folderIndependenceProblem, formatBytes, scanBrowserFiles, summarize } from './core';
import { sampleResult } from './sample';
import type { CheckResult, LicenseState, TargetScan } from './types';

declare const __APP_BUILD__: boolean;

const PRODUCT = 'family-archive-check';
const SITE = 'https://family-archive-check.sociobot.in';
const REPO = 'B-Divyesh/sf-family-archive-check';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const isTauri = '__TAURI_INTERNALS__' in window;
const LICENSE_VERIFY_ENDPOINT = (__APP_BUILD__ || isTauri)
  ? `${SITE}/api/license/verify`
  : '/api/license/verify';
const REAL_PROFILES_KEY = `${PRODUCT}:profiles`;
const app = document.querySelector<HTMLDivElement>('#app')!;
let nativeRoute = '/check';
let primaryScan: TargetScan | undefined;
let backupScan: TargetScan | undefined;
let currentResult: CheckResult | undefined;
let demoResult = sampleResult();
let importedRecovery: CheckResult | undefined;
let restoredScan: TargetScan | undefined;
let showingHandoff = false;
let busy = false;
let scanError = '';

interface FolderProfile { main: string; backup: string; savedAt: string }
type VisitorPlatform = 'mobile' | 'windows' | 'mac' | 'linux' | 'other';

const escapeHtml = (value: unknown) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);

function visitorPlatform(): VisitorPlatform {
  const navigatorWithHints = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
  if (navigatorWithHints.userAgentData?.mobile || /Android/i.test(userAgent) || isAppleMobile) return 'mobile';
  if (/Win/i.test(platform)) return 'windows';
  if (/Mac/i.test(platform)) return 'mac';
  if (/Linux|X11/i.test(platform)) return 'linux';
  return 'other';
}

function externalActionLabel(element: HTMLAnchorElement, label: string) {
  element.replaceChildren(label, Object.assign(document.createElement('span'), {
    className: 'sr-only',
    textContent: ' (external site)'
  }));
  element.rel = 'external';
}

function routePath() {
  if (__APP_BUILD__ || isTauri) return nativeRoute;
  if (new URL(location.href).searchParams.get('demo') === '1') return '/demo';
  return location.pathname.replace(/\/$/, '') || '/';
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Family Archive Check — Check photo backup copies',
    description: 'Check that family photos and videos have a readable, independent copy before handoff.'
  },
  '/demo': {
    title: 'Demo — Family Archive Check',
    description: 'Try a finished family archive check with six sample files and one missing copy.'
  },
  '/check': {
    title: 'Check folders — Family Archive Check',
    description: 'Choose a main family archive and an independent copy, then check what needs attention.'
  },
  '/privacy': {
    title: 'Privacy — Family Archive Check',
    description: 'Learn what Family Archive Check keeps on your device and which online requests it makes.'
  },
  '/terms': {
    title: 'Terms — Family Archive Check',
    description: 'Read the terms for checks, household licenses, and recovery reports.'
  },
  '/print/sample-family-archive': {
    title: 'Sample recovery sheet — Family Archive Check',
    description: 'Print the sample family archive locations, check result, and four recovery steps.'
  },
  '/404': {
    title: 'Page not found — Family Archive Check',
    description: 'The requested Family Archive Check page was not found.'
  }
};

function setMetadata(path: string) {
  const key = path;
  const metadata = routeMetadata[key] ?? routeMetadata['/404'];
  const canonicalPath = path === '/404' ? '/404.html' : path;
  const canonical = `${SITE}${canonicalPath === '/' ? '/' : canonicalPath}`;
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = metadata.description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = canonical;
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    document.querySelector<HTMLMetaElement>(selector)!.content = metadata.title;
  }
  for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    document.querySelector<HTMLMetaElement>(selector)!.content = metadata.description;
  }
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = canonical;
}

function header(active: string) {
  return `<header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="Family Archive Check"><span class="wordmark-mark" aria-hidden="true">FAC</span><span>Family Archive Check</span></a>
    <nav aria-label="Main navigation">
      <a href="/demo" data-link ${active === 'demo' ? 'aria-current="page"' : ''}>Demo</a>
      <a href="/check" data-link ${active === 'check' ? 'aria-current="page"' : ''}>Check folders</a>
      <a href="/privacy" data-link ${active === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a>
    </nav>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <p>Check family photo copies before handoff.</p>
    <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
    <p>Version 0.1.9 · Generated art disclosed in the design notes.</p>
  </footer>`;
}

function shell(active: string, content: string, demo = false) {
  return `${header(active)}${demo ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span><button class="text-button" id="reset-demo">Reset demo</button><button class="text-button" id="leave-demo">Start for real</button></span></aside>` : ''}<main id="main" tabindex="-1">${content}</main>${footer()}<div class="route-announcer sr-only" aria-live="polite"></div>`;
}

function landing() {
  const platform = visitorPlatform();
  const needsDesktop = platform === 'mobile' || platform === 'other';
  const downloadCopy = needsDesktop
    ? 'Open this page on macOS, Windows, or Linux to install.'
    : 'Checking the latest release for this device…';
  const downloadAction = needsDesktop ? 'View desktop releases' : 'View releases';
  return shell('home', `
    <section class="hero poster-section">
      <div class="hero-copy">
        <p class="eyebrow">Recovery check · desktop app</p>
        <h1 tabindex="-1">Check every family photo and video has a copy</h1>
        <p class="lede">For household archivists who need a clear answer before handing photos and videos to family.</p>
        <div class="hero-actions"><a class="button primary" href="/?demo=1">Try it with sample data</a><span>See a finished two-folder check.</span></div>
        <dl class="plain-facts">
          <div><dt>Private</dt><dd>Files stay on this device.</dd></div>
          <div><dt>Offline</dt><dd>Works offline after the first visit.</dd></div>
          <div><dt>Price</dt><dd>Free for 500 files. Household license: $29 once.</dd></div>
        </dl>
      </div>
      <picture class="hero-art">
        <source media="(max-width: 700px)" srcset="/assets/archive-route-800.webp" />
        <img src="/assets/archive-route.webp" width="1280" height="853" alt="Two archive cases travel on separate rails through a verification gate." fetchpriority="high" />
      </picture>
    </section>
    <section class="live-preview" aria-labelledby="preview-title">
      <div><p class="eyebrow">Sample check · 28 August 2026</p><h2 id="preview-title">One missing video needs attention</h2><p>The main archive has six items. The independent copy has five.</p></div>
      <div class="route-map" aria-label="Main archive has six items, independent copy has five, and one item is missing.">
        <span class="station"><b>6</b>Main archive</span><span class="rail" aria-hidden="true"></span><span class="station warning"><b>5</b>Independent copy</span>
      </div>
      <a class="button secondary" href="/demo" data-link>Open this sample check</a>
    </section>
    <section class="steps" aria-labelledby="steps-title">
      <p class="eyebrow">Three steps</p><h2 id="steps-title">How the check works</h2>
      <ol>
        <li><span>01</span><h3>Choose two folders</h3><p>Pick the main archive and one independent copy.</p></li>
        <li><span>02</span><h3>Read and compare</h3><p>The app counts every file, opens a sample, and checks whether matching files changed.</p></li>
        <li><span>03</span><h3>Export the recovery file list</h3><p>Save a recovery file list (JSON) and print plain recovery steps.</p></li>
      </ol>
    </section>
    <section class="walkthrough" aria-labelledby="walk-title">
      <p class="eyebrow">Inside the desktop app</p><h2 id="walk-title">See the desktop check from folder choice to report</h2>
      <div class="walk-grid">
        <figure><div class="walk-frame"><b>1 · MAIN ARCHIVE</b><span>/Photos/Family</span><span class="mock-button" aria-hidden="true">Choose folder</span></div><figcaption>Choose folders. The app only reads them.</figcaption></figure>
        <figure><div class="walk-frame"><b>2 · CHECK</b><span class="mini-route">●━━━━━━●</span><em>Checking up to 48 media files</em></div><figcaption>The app counts and tests both folders the same way.</figcaption></figure>
        <figure><div class="walk-frame result-mini"><b>3 · REPORT</b><strong>1 item needs attention</strong><span>Export recovery file list</span></div><figcaption>Keep the recovery file list beside the archive.</figcaption></figure>
      </div>
    </section>
    <section class="boundaries" aria-labelledby="privacy-title"><div><p class="eyebrow">Read-only by default</p><h2 id="privacy-title">Your folders stay unchanged</h2></div><div><p>The app does not move, rename, edit, upload, or identify people in media.</p><p>Keep an independent backup and test recovery yourself.</p><p>Only an exported recovery file list writes a new file.</p></div></section>
    <section class="purchase" aria-labelledby="price-title">
      <div><p class="eyebrow">Household license</p><h2 id="price-title">Check archives larger than 500 files</h2><p>Pay $29 once for unlimited checks and saved folder profiles.</p></div>
      <div><a class="button gold" href="https://api.sociobot.in/api/v1/products/family-archive-check/checkout" rel="external">Buy household license — $29 <span class="sr-only">(external site)</span></a><button class="text-button" id="show-license">Enter license token</button><p class="fine-print">Dodo Payments takes your payment and handles questions or requests about your order.</p></div>
    </section>
    <section class="download-band" aria-labelledby="download-title"><div><p class="eyebrow">Desktop app</p><h2 id="download-title">Install for full folder checks</h2><p id="download-copy">${downloadCopy}</p></div><a class="button primary" id="download-button" href="https://github.com/${REPO}/releases" rel="external">${downloadAction} <span class="sr-only">(external site)</span></a></section>
    <div class="license-panel" id="license-panel" hidden><label for="license-token">License token</label><div><input id="license-token" autocomplete="off" /><button id="save-license">Verify license</button></div><p id="license-status" role="status"></p></div>
  `);
}

function legal(kind: 'privacy' | 'terms') {
  const privacy = kind === 'privacy';
  return shell(kind, `<article class="legal"><p class="eyebrow">Effective 28 August 2026</p><h1 tabindex="-1">${privacy ? 'Privacy without fine print' : 'Terms for using the app'}</h1>${privacy ? `
    <h2>What stays on your device</h2><p>Folder names, file details, sample checks, and recovery file lists stay on your device. We do not receive them.</p>
    <h2>License checks</h2><p>If you add a license, the app sends only that token through our verification endpoint to Sociobot. It allows 10 checks per client address in 10 minutes. After that, it returns a retry time. The endpoint stores a keyed address hash, counter, and reset time to enforce that limit. The token and last result stay in local storage.</p>
    <h2>Website requests</h2><p>The website asks GitHub for the latest public release. We use no ad trackers or third-party fonts.</p>
    <h2>Remove saved data</h2><p>Remove a license in the app, or clear this site’s storage in your browser settings.</p>` : `
    <h2>Use it as a check, not a backup</h2><p>The app reports what it can read and compare. Keep independent backups and test recovery yourself.</p>
    <h2>Your responsibility</h2><p>Review folder choices and exported reports. The software is provided under the MIT License without a recovery guarantee.</p>
    <h2>Purchases</h2><p>A $29 purchase grants one household a continuing license. Dodo Payments handles payment and questions about the order.</p>
    <h2>Fair use</h2><p>Do not use the service to attack license systems or interfere with the release website.</p>`}<p><a href="/" data-link>Return to the home page</a></p></article>`);
}

function checker(demo = false) {
  const result = demo ? demoResult : currentResult;
  const storageUnverified = Boolean(result && !demo && !isTauri && !result.primary.storageId);
  if (!demo && showingHandoff && result) return printPage(result, false);
  if (!demo && importedRecovery && !result) return recoveryChecker();
  const heading = result ? result.verdict === 'ready'
    ? (storageUnverified ? 'Files match; drive separation is unverified' : 'Both archive copies are ready')
    : issueHeading(result) : 'Check two archive folders';
  return shell(demo ? 'demo' : 'check', `
    <section class="app-screen">
      <div class="app-heading"><div><p class="eyebrow">${demo ? 'Sample archive' : 'New archive check'}</p><h1 tabindex="-1">${heading}</h1><p>${result ? 'Review the difference, then export a recovery file list.' : 'Choose the main archive and an independent copy. Nothing will be changed.'}</p></div>${!result ? '<span class="read-only-stamp">Read only</span>' : ''}</div>
      ${result ? resultView(result, demo) : pickerView()}
      ${!demo ? appLicenseView() : ''}
    </section>`, demo);
}

function pickerView() {
  const profiles = licenseState().active ? savedProfiles() : [];
  const independenceProblem = primaryScan && backupScan ? folderIndependenceProblem(primaryScan, backupScan) : undefined;
  return `<section class="check-panel" aria-label="Folder choices">
    <div class="route-progress ${busy ? 'is-moving' : ''}" aria-hidden="true"><i></i></div>
    <div class="folder-stop"><span class="stop-number">01</span><div><h2>Main archive</h2><p id="primary-path">${primaryScan ? escapeHtml(primaryScan.path) : 'Choose the folder you treat as the original archive. Choosing starts a read-only inventory.'}</p></div><button id="choose-primary">${primaryScan ? 'Choose a different folder' : 'Choose and read main archive'}</button></div>
    <div class="folder-stop"><span class="stop-number">02</span><div><h2>Independent copy</h2><p id="backup-path">${backupScan ? escapeHtml(backupScan.path) : 'Choose a copy on another connected drive or network folder. Choosing starts a read-only inventory.'}</p></div><button id="choose-backup">${backupScan ? 'Choose a different folder' : 'Choose and read backup folder'}</button></div>
    <div class="scan-action"><button class="button primary" id="run-check" ${!primaryScan || !backupScan || busy || independenceProblem ? 'disabled' : ''}>${busy ? 'Checking folders…' : 'Check both folders'}</button><p id="scan-status" role="status">${busy ? 'Reading files. Large folders can take several minutes.' : 'The app opens a repeatable sample of media. It never changes the folders.'}</p></div>
    <input class="sr-only" type="file" id="primary-input" aria-label="Choose main archive folder" tabindex="-1" webkitdirectory multiple /><input class="sr-only" type="file" id="backup-input" aria-label="Choose independent copy folder" tabindex="-1" webkitdirectory multiple />
    ${independenceProblem || scanError ? `<p class="scan-error" role="alert">${escapeHtml(independenceProblem || scanError)}</p>` : ''}
    ${!isTauri ? '<p class="browser-note">The website can spot the same folder name. Only the desktop app can confirm that folders are on separate drives.</p>' : ''}
    ${profiles.length ? `<div class="saved-profiles"><h2>Saved folder profiles</h2><p>Choose a profile to read both folders again.</p><ul>${profiles.map((profile, index) => `<li><div><strong>${escapeHtml(profile.main)}</strong><span>${escapeHtml(profile.backup)}</span></div><button data-use-profile="${index}">Read this profile</button><button class="text-button" data-forget-profile="${index}">Forget</button></li>`).join('')}</ul></div>` : ''}
    <div class="empty-guidance"><h2>${profiles.length ? 'Start another check' : 'No folders chosen yet'}</h2><p>Your counts and copy differences will appear here after one check.</p><button class="text-button" id="load-sample">Load sample project</button></div>
    <section class="recovery-import" aria-labelledby="import-title"><h2 id="import-title">Check a restored folder</h2><p>Import a recovery file list, then compare a restored folder with its saved paths, sizes, and sampled fingerprints.</p><button class="button secondary" id="import-recovery-file">Import recovery file list</button><input class="sr-only" type="file" id="recovery-file-input" aria-label="Import recovery file list" accept="application/json,.json" tabindex="-1" /><p id="import-status" role="status"></p></section>
  </section>`;
}

function recoveryChecker() {
  const baseline = importedRecovery!;
  return shell('check', `<section class="app-screen"><div class="app-heading"><div><p class="eyebrow">Recovery check</p><h1 tabindex="-1">Check a restored folder</h1><p>Compare the restored folder with the imported recovery file list. Nothing will be changed.</p></div><span class="read-only-stamp">Read only</span></div>
    <section class="check-panel recovery-panel" aria-label="Restored folder choice"><div class="folder-stop"><span class="stop-number">01</span><div><h2>Imported recovery file list</h2><p>${escapeHtml(baseline.primary.path)} · ${baseline.primary.files.length} saved entries</p></div><button class="text-button" id="cancel-recovery">Use two folders instead</button></div>
    <div class="folder-stop"><span class="stop-number">02</span><div><h2>Restored folder</h2><p id="restored-path">${restoredScan ? escapeHtml(restoredScan.path) : 'Choose the folder restored from your independent copy. Choosing starts a read-only inventory.'}</p></div><button id="choose-restored">${restoredScan ? 'Choose a different restored folder' : 'Choose and read restored folder'}</button></div>
    <div class="scan-action"><button class="button primary" id="run-recovery-check" ${!restoredScan || busy ? 'disabled' : ''}>${busy ? 'Checking restored folder…' : 'Check restored folder'}</button><p role="status">The app compares saved paths, sizes, and sampled fingerprints. It never changes the folder.</p></div><input class="sr-only" type="file" id="restored-input" aria-label="Choose restored folder" tabindex="-1" webkitdirectory multiple />${scanError ? `<p class="scan-error" role="alert">${escapeHtml(scanError)}</p>` : ''}</section></section>${appLicenseView()}`);
}

function resultView(result: CheckResult, demo: boolean) {
  const main = summarize(result.primary);
  const backup = summarize(result.backup);
  const issues = [...result.missingFromBackup, ...result.changed, ...result.unreadable];
  const storageUnverified = !demo && !isTauri && !result.primary.storageId && result.verdict === 'ready';
  return `<section class="result-panel">
    <div class="verdict ${storageUnverified ? 'attention' : result.verdict}" role="status"><span aria-hidden="true">${result.verdict === 'ready' && !storageUnverified ? '✓' : '!'}</span><div><strong>${result.verdict === 'ready' ? (storageUnverified ? 'Confirm separate drives' : 'Ready for handoff') : `${issues.length} item${issues.length === 1 ? ' needs' : 's need'} attention`}</strong><p>${result.matched} path${result.matched === 1 ? '' : 's'} match across both folders.</p>${storageUnverified ? '<p>The browser cannot identify storage devices. Repeat this check in the desktop app before handoff.</p>' : ''}</div></div>
    <div class="archive-comparison">
      <article><p class="eyebrow">Main archive</p><h2>${main.files} files</h2><dl><div><dt>Photos</dt><dd>${main.photo}</dd></div><div><dt>Videos</dt><dd>${main.video}</dd></div><div><dt>Size</dt><dd>${formatBytes(main.bytes)}</dd></div><div><dt>Location</dt><dd>${escapeHtml(result.primary.path)}</dd></div></dl></article>
      <div class="comparison-line" aria-hidden="true"><span></span></div>
      <article><p class="eyebrow">${escapeHtml(result.backup.label)}</p><h2>${backup.files} files</h2><dl><div><dt>Photos</dt><dd>${backup.photo}</dd></div><div><dt>Videos</dt><dd>${backup.video}</dd></div><div><dt>Size</dt><dd>${formatBytes(backup.bytes)}</dd></div><div><dt>Location</dt><dd>${escapeHtml(result.backup.path)}</dd></div></dl></article>
    </div>
    <div class="check-evidence"><h2>What was checked</h2><ul><li><strong>${result.sampledHashes}</strong> sampled file fingerprints compared</li><li><strong>${result.dateCoverage}%</strong> of main media has a known year</li><li><strong>${result.unreadable.length}</strong> unreadable file entries</li></ul></div>
    <div class="difference-list"><h2>Items to review</h2>${issues.length || result.extraOnBackup.length ? `<ul>${result.missingFromBackup.map((path) => `<li><span class="issue-label">Missing from copy</span><code>${escapeHtml(path)}</code></li>`).join('')}${result.changed.map((path) => `<li><span class="issue-label">Different file</span><code>${escapeHtml(path)}</code></li>`).join('')}${result.unreadable.map((path) => `<li><span class="issue-label">Could not read</span><code>${escapeHtml(path)}</code></li>`).join('')}${result.extraOnBackup.map((path) => `<li><span class="issue-label extra">Only on copy</span><code>${escapeHtml(path)}</code></li>`).join('')}</ul>` : '<p>No missing, changed, extra, or unreadable items were found.</p>'}</div>
    <div class="result-actions"><button class="button primary" id="export-manifest">Export recovery file list</button><button class="button secondary" id="print-handoff">${demo ? 'Print handoff sheet' : 'Preview handoff sheet'}</button>${!demo && licenseState().active ? '<button class="button secondary" id="save-profile">Save folder profile</button>' : ''}${!demo ? '<button class="text-button" id="new-check">Start a new check</button>' : ''}</div>
    <p class="fine-print">The recovery file list includes paths, sizes, dates, and sampled fingerprints. Keep it beside both copies.</p>
  </section>`;
}

function appLicenseView() {
  const state = licenseState();
  const inactiveNotice = state.reason && state.reason !== 'ok' ? '<p class="license-notice" role="status">License no longer active. Paste a current license or buy one below.</p>' : '';
  return `<aside class="app-license" aria-label="Household license"><div><p class="eyebrow">Household license</p><strong>${state.active ? 'License active' : 'Free checks include up to 500 files'}</strong><p>${state.active ? 'Unlimited checks and saved folder profiles are available.' : 'Pay $29 once for unlimited checks and saved folder profiles.'}</p>${inactiveNotice}</div>${state.active ? '<button class="text-button" id="remove-license">Remove license</button>' : `<div><a href="https://api.sociobot.in/api/v1/products/${PRODUCT}/checkout" target="_blank" rel="external">Buy household license — $29 <span class="sr-only">(external site)</span></a><label for="app-license-token">Or paste a license token</label><div class="inline-license"><input id="app-license-token" autocomplete="off"><button id="verify-app-license">Verify license</button></div><p id="app-license-status" role="status"></p></div>`}</aside>`;
}

function notFound() {
  return shell('', `<section class="not-found"><p class="error-code">Error 404</p><h1 tabindex="-1">This page was not found</h1><p>Check the address, or return to the home page.</p><a class="button primary" href="/" data-link>Return to the home page</a></section>`);
}

function issueCount(result: CheckResult) {
  return result.missingFromBackup.length + result.changed.length + result.unreadable.length;
}

function issueHeading(result: CheckResult) {
  const count = issueCount(result);
  return count === 1 ? 'One archive item needs attention' : `${count} archive items need attention`;
}

function render({ announceRoute = false }: { announceRoute?: boolean } = {}) {
  const path = routePath();
  setMetadata(routeMetadata[path] || path.startsWith('/print/') ? path : '/404');
  if (path === '/') app.innerHTML = landing();
  else if (path === '/demo') app.innerHTML = checker(true);
  else if (path === '/check') app.innerHTML = checker(false);
  else if (path === '/privacy') app.innerHTML = legal('privacy');
  else if (path === '/terms') app.innerHTML = legal('terms');
  else if (path === '/print/sample-family-archive') app.innerHTML = printPage(sampleResult(), true);
  else app.innerHTML = notFound();
  bindEvents();
  if (announceRoute) {
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    document.querySelector('.route-announcer')!.textContent = document.querySelector('h1')?.textContent ?? '';
  }
  if (path === '/') void loadRelease();
}

function printPage(result: CheckResult, demo: boolean) {
  return shell(demo ? 'demo' : 'check', printSheet(result), demo);
}

function printSheet(result: CheckResult) {
  const issues = [...result.missingFromBackup, ...result.changed, ...result.unreadable];
  return `<section class="print-sheet"><p class="eyebrow">Family Archive Check · recovery handoff</p><h1 tabindex="-1">How to recover this family archive</h1><p>Checked ${new Date(result.checkedAt).toLocaleDateString()} · Check ID ${escapeHtml(result.checkId)}</p><ol><li>Connect the drive that contains <strong>${escapeHtml(result.backup.path)}</strong>.</li><li>Copy its contents to a new, empty folder.</li><li>Open several photos and videos from different years.</li><li>Import the recovery file list to compare the restored folder.</li></ol><h2>Locations</h2><dl><div><dt>Main archive</dt><dd>${escapeHtml(result.primary.path)}</dd></div><div><dt>${escapeHtml(result.backup.label)}</dt><dd>${escapeHtml(result.backup.path)}</dd></div></dl><h2>Check result</h2><p>${result.matched} matching paths. ${issues.length} ${issues.length === 1 ? 'item needs' : 'items need'} review.</p>${issues.length ? `<ul>${issues.map((path) => `<li>${escapeHtml(path)}</li>`).join('')}</ul>` : ''}<div class="print-actions"><button class="button primary" id="print-now">Print this sheet</button><button class="text-button" id="close-print">Return to results</button></div></section>`;
}

function navigate(path: string) {
  if (__APP_BUILD__ || isTauri) {
    nativeRoute = path;
    render({ announceRoute: true });
    scrollTo({ top: 0, behavior: 'auto' });
    return;
  }
  history.pushState({}, '', path);
  render({ announceRoute: true });
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

async function chooseFolder(which: 'primary' | 'backup') {
  if (isTauri) {
    try {
      scanError = '';
      const { open } = await import('@tauri-apps/plugin-dialog');
      const path = await open({ directory: true, multiple: false, title: which === 'primary' ? 'Choose main archive' : 'Choose independent copy' });
      if (!path) return;
      busy = true;
      render();
      const { invoke } = await import('@tauri-apps/api/core');
      const scan = await invoke<TargetScan>('scan_folder', { path, label: which === 'primary' ? 'Main archive' : 'Independent copy' });
      if (which === 'primary') primaryScan = scan; else backupScan = scan;
      scanError = primaryScan && backupScan ? folderIndependenceProblem(primaryScan, backupScan) ?? '' : '';
    } catch (error) {
      scanError = `The folder could not be read. Check the drive, then choose it again. ${String(error)}`;
    } finally {
      busy = false;
      render();
    }
    return;
  }
  document.querySelector<HTMLInputElement>(`#${which}-input`)?.click();
}

function savedProfiles(): FolderProfile[] {
  try {
    const value = JSON.parse(localStorage.getItem(REAL_PROFILES_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((profile): profile is FolderProfile =>
      typeof profile?.main === 'string' && typeof profile?.backup === 'string' && typeof profile?.savedAt === 'string'
    ) : [];
  } catch {
    return [];
  }
}

async function readSavedProfile(index: number) {
  const profile = savedProfiles()[index];
  if (!profile) return;
  if (!isTauri) {
    scanError = 'Saved profiles can reopen folders in the installed desktop app. Choose both folders again in this browser.';
    render();
    return;
  }
  busy = true;
  scanError = '';
  render();
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    [primaryScan, backupScan] = await Promise.all([
      invoke<TargetScan>('scan_folder', { path: profile.main, label: 'Main archive' }),
      invoke<TargetScan>('scan_folder', { path: profile.backup, label: 'Independent copy' })
    ]);
    scanError = folderIndependenceProblem(primaryScan, backupScan) ?? '';
  } catch (error) {
    scanError = `A saved folder could not be read. Connect both drives, then try again. ${String(error)}`;
  } finally {
    busy = false;
    render();
  }
}

async function acceptBrowserFolder(which: 'primary' | 'backup', files: FileList | null) {
  if (!files?.length) return;
  busy = true;
  render();
  try {
    const scan = await scanBrowserFiles(files, which === 'primary' ? 'Main archive' : 'Independent copy');
    if (which === 'primary') primaryScan = scan; else backupScan = scan;
    scanError = primaryScan && backupScan ? folderIndependenceProblem(primaryScan, backupScan) ?? '' : '';
  } catch (error) {
    scanError = `The folder could not be read. Check the drive, then choose it again. ${error instanceof Error ? error.message : ''}`;
  } finally {
    busy = false;
    render();
  }
}

async function chooseRestoredFolder() {
  if (isTauri) {
    try {
      scanError = '';
      const { open } = await import('@tauri-apps/plugin-dialog');
      const path = await open({ directory: true, multiple: false, title: 'Choose restored folder' });
      if (!path) return;
      busy = true;
      render();
      const { invoke } = await import('@tauri-apps/api/core');
      restoredScan = await invoke<TargetScan>('scan_folder', { path, label: 'Restored folder' });
    } catch (error) {
      scanError = `The restored folder could not be read. Check the drive, then choose it again. ${String(error)}`;
    } finally {
      busy = false;
      render();
    }
    return;
  }
  document.querySelector<HTMLInputElement>('#restored-input')?.click();
}

async function acceptRestoredFolder(files: FileList | null) {
  if (!files?.length) return;
  busy = true;
  scanError = '';
  render();
  try {
    restoredScan = await scanBrowserFiles(files, 'Restored folder');
  } catch (error) {
    scanError = `The restored folder could not be read. Check the folder, then choose it again. ${error instanceof Error ? error.message : ''}`;
  } finally {
    busy = false;
    render();
  }
}

function isFileRecord(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && typeof (value as Record<string, unknown>).relativePath === 'string' &&
    typeof (value as Record<string, unknown>).size === 'number' && typeof (value as Record<string, unknown>).readable === 'boolean' &&
    typeof (value as Record<string, unknown>).sampled === 'boolean';
}

function isTargetScan(value: unknown): value is TargetScan {
  return Boolean(value) && typeof value === 'object' && typeof (value as Record<string, unknown>).path === 'string' &&
    typeof (value as Record<string, unknown>).label === 'string' && Array.isArray((value as Record<string, unknown>).files) &&
    ((value as Record<string, unknown>).files as unknown[]).every(isFileRecord);
}

function isRecoveryFileList(value: unknown): value is CheckResult {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.version === 1 && typeof record.checkId === 'string' && typeof record.checkedAt === 'string' &&
    isTargetScan(record.primary) && isTargetScan(record.backup) && typeof record.matched === 'number' &&
    typeof record.sampledHashes === 'number' && typeof record.dateCoverage === 'number' &&
    (record.verdict === 'ready' || record.verdict === 'attention') &&
    ['missingFromBackup', 'extraOnBackup', 'changed', 'unreadable'].every((key) => Array.isArray(record[key]) && record[key].every((entry) => typeof entry === 'string'));
}

async function importRecoveryFile(files: FileList | null) {
  const file = files?.[0];
  if (!file) return;
  try {
    const value: unknown = JSON.parse(await file.text());
    if (!isRecoveryFileList(value)) throw new Error('This file is not a Family Archive Check recovery file list.');
    importedRecovery = value;
    restoredScan = undefined;
    scanError = '';
    currentResult = undefined;
    render({ announceRoute: true });
  } catch (error) {
    const status = document.querySelector<HTMLElement>('#import-status');
    if (status) status.textContent = error instanceof Error ? error.message : 'The recovery file list could not be read.';
  }
}

function runCheck() {
  if (!primaryScan || !backupScan) return;
  const independenceProblem = folderIndependenceProblem(primaryScan, backupScan);
  if (independenceProblem) {
    scanError = independenceProblem;
    render();
    return;
  }
  if (exceedsFreeLimit(primaryScan.files.length, backupScan.files.length, licenseState().active)) {
    alert('This check has more than 500 files. Add a household license, then check these folders again.');
    return;
  }
  busy = true;
  render();
  setTimeout(() => {
    currentResult = compareScans(primaryScan!, backupScan!);
    showingHandoff = false;
    busy = false;
    render();
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
}

function runRecoveryCheck() {
  if (!importedRecovery || !restoredScan) return;
  busy = true;
  render();
  setTimeout(() => {
    currentResult = compareScans(importedRecovery!.primary, restoredScan!);
    showingHandoff = false;
    busy = false;
    render();
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
}

async function exportManifest() {
  const result = routePath() === '/demo' ? demoResult : currentResult;
  if (!result) return;
  const json = JSON.stringify(result, null, 2);
  if (isTauri) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const path = await save({ defaultPath: exportName(result), filters: [{ name: 'Recovery file list', extensions: ['json'] }] });
    if (!path) return;
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('write_manifest', { path, contents: json });
  } else {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const anchor = Object.assign(document.createElement('a'), { href: url, download: exportName(result) });
    anchor.click();
    URL.revokeObjectURL(url);
  }
  const status = document.querySelector('.fine-print');
  if (status) status.textContent = `Saved ${exportName(result)}. Keep it beside both copies.`;
}

function licenseState(): LicenseState {
  try { return JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) ?? '{"active":false}'); } catch { return { active: false }; }
}

async function verifyLicense(token: string) {
  const status = document.querySelector<HTMLElement>('#license-status');
  if (status) status.textContent = 'Checking this license…';
  try {
    const response = await fetch(`${LICENSE_VERIFY_ENDPOINT}?license=${encodeURIComponent(token)}`);
    const data = await response.json() as { valid: boolean; reason?: string; retry_after_seconds?: number };
    if (response.status === 429 || data.reason === 'rate_limited') {
      const seconds = Number(response.headers.get('Retry-After') ?? data.retry_after_seconds) || 1;
      if (status) status.textContent = `Too many license checks from this connection. Try again in ${seconds} seconds.`;
      return;
    }
    if (!response.ok || data.reason === 'unavailable') throw new Error('License verification unavailable');
    localStorage.setItem(LICENSE_KEY, token);
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ active: data.valid, checkedAt: Date.now(), reason: data.reason }));
    if (status) status.textContent = data.valid ? 'License active. Unlimited checks are ready.' : 'This license is not active. Check the token or buy a new license.';
  } catch {
    if (status) status.textContent = 'The license server could not be reached. Try again when you are online.';
  }
}

async function acceptLicenseFromUrl() {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  await verifyLicense(token);
  return true;
}

async function refreshLicense() {
  const token = localStorage.getItem(LICENSE_KEY);
  const cached = licenseState();
  if (!token || (cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000)) return false;
  await verifyLicense(token);
  return true;
}

async function loadRelease() {
  const copy = document.querySelector('#download-copy');
  const button = document.querySelector<HTMLAnchorElement>('#download-button');
  if (!copy || !button) return;
  const platform = visitorPlatform();
  if (platform === 'mobile' || platform === 'other') {
    copy.textContent = 'Open this page on macOS, Windows, or Linux to install.';
    externalActionLabel(button, 'View desktop releases');
    return;
  }
  try {
    const key = 'family-archive-check:release';
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as { time: number; release: Release } | null;
    const release = saved && Date.now() - saved.time < 3_600_000 ? saved.release : await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=1`).then(async (response) => {
      if (!response.ok) throw new Error('release unavailable');
      const releases = await response.json() as Release[];
      if (!releases[0]) throw new Error('platform asset unavailable');
      return releases[0];
    });
    if (!saved || saved.release.tag_name !== release.tag_name) localStorage.setItem(key, JSON.stringify({ time: Date.now(), release }));
    const match = release.assets.find((asset) => platform === 'windows' ? /\.(msi|exe)$/i.test(asset.name) : platform === 'mac' ? /\.(dmg|app\.tar\.gz)$/i.test(asset.name) : /\.(AppImage|deb)$/i.test(asset.name));
    if (!match) throw new Error('platform asset unavailable');
    button.href = match.browser_download_url;
    externalActionLabel(button, `Download for ${platform === 'mac' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}`);
    copy.textContent = `${release.tag_name} is ready. Choose the installer for this device.`;
  } catch {
    copy.textContent = 'Downloads are being published. The release page shows current progress.';
    externalActionLabel(button, 'View release page');
  }
}

interface Release { tag_name: string; assets: { name: string; browser_download_url: string }[] }

function bindEvents() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || link.target) return;
    event.preventDefault();
    const url = new URL(link.href);
    navigate(`${url.pathname}${url.search}`);
  }));
  document.querySelector('#reset-demo')?.addEventListener('click', () => { demoResult = sampleResult(); render(); });
  document.querySelector('#leave-demo')?.addEventListener('click', () => { demoResult = sampleResult(); navigate('/check'); });
  document.querySelector('#load-sample')?.addEventListener('click', () => { demoResult = sampleResult(); if (!__APP_BUILD__ && !isTauri) navigate('/?demo=1'); else { currentResult = sampleResult(); render(); } });
  document.querySelector('#choose-primary')?.addEventListener('click', () => void chooseFolder('primary'));
  document.querySelector('#choose-backup')?.addEventListener('click', () => void chooseFolder('backup'));
  document.querySelectorAll<HTMLButtonElement>('[data-use-profile]').forEach((button) => button.addEventListener('click', () => void readSavedProfile(Number(button.dataset.useProfile))));
  document.querySelectorAll<HTMLButtonElement>('[data-forget-profile]').forEach((button) => button.addEventListener('click', () => {
    const profiles = savedProfiles();
    profiles.splice(Number(button.dataset.forgetProfile), 1);
    localStorage.setItem(REAL_PROFILES_KEY, JSON.stringify(profiles));
    render();
  }));
  document.querySelector('#primary-input')?.addEventListener('change', (event) => void acceptBrowserFolder('primary', (event.target as HTMLInputElement).files));
  document.querySelector('#backup-input')?.addEventListener('change', (event) => void acceptBrowserFolder('backup', (event.target as HTMLInputElement).files));
  document.querySelector('#import-recovery-file')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#recovery-file-input')?.click());
  document.querySelector('#recovery-file-input')?.addEventListener('change', (event) => void importRecoveryFile((event.target as HTMLInputElement).files));
  document.querySelector('#choose-restored')?.addEventListener('click', () => void chooseRestoredFolder());
  document.querySelector('#restored-input')?.addEventListener('change', (event) => void acceptRestoredFolder((event.target as HTMLInputElement).files));
  document.querySelector('#run-recovery-check')?.addEventListener('click', runRecoveryCheck);
  document.querySelector('#cancel-recovery')?.addEventListener('click', () => { importedRecovery = restoredScan = undefined; scanError = ''; render({ announceRoute: true }); });
  document.querySelector('#run-check')?.addEventListener('click', runCheck);
  document.querySelector('#export-manifest')?.addEventListener('click', () => void exportManifest());
  document.querySelector('#print-handoff')?.addEventListener('click', () => {
    if (routePath() === '/demo') navigate('/print/sample-family-archive');
    else { showingHandoff = true; render({ announceRoute: true }); }
  });
  document.querySelector('#print-now')?.addEventListener('click', () => print());
  document.querySelector('#close-print')?.addEventListener('click', () => {
    if (routePath() === '/print/sample-family-archive') navigate('/demo');
    else { showingHandoff = false; render({ announceRoute: true }); }
  });
  document.querySelector('#new-check')?.addEventListener('click', () => { currentResult = primaryScan = backupScan = importedRecovery = restoredScan = undefined; showingHandoff = false; render(); });
  document.querySelector('#save-profile')?.addEventListener('click', () => {
    if (!currentResult || !licenseState().active) return;
    const profiles = savedProfiles().filter((profile) => profile.main !== currentResult?.primary.path || profile.backup !== currentResult?.backup.path);
    profiles.push({ main: currentResult.primary.path, backup: currentResult.backup.path, savedAt: new Date().toISOString() });
    localStorage.setItem(REAL_PROFILES_KEY, JSON.stringify(profiles.slice(-12)));
    alert('Folder profile saved on this device. Choose the folders again if drive permissions change.');
  });
  document.querySelector('#show-license')?.addEventListener('click', () => { const panel = document.querySelector<HTMLElement>('#license-panel'); if (panel) { panel.hidden = false; panel.querySelector('input')?.focus(); } });
  document.querySelector('#save-license')?.addEventListener('click', () => { const token = (document.querySelector<HTMLInputElement>('#license-token')?.value ?? '').trim(); if (token) void verifyLicense(token); });
  document.querySelector('#verify-app-license')?.addEventListener('click', async () => {
    const token = (document.querySelector<HTMLInputElement>('#app-license-token')?.value ?? '').trim();
    if (!token) return;
    const siteStatus = document.querySelector('#app-license-status');
    if (siteStatus) siteStatus.id = 'license-status';
    await verifyLicense(token);
    if (licenseState().active) render();
  });
  document.querySelector('#remove-license')?.addEventListener('click', () => { localStorage.removeItem(LICENSE_KEY); localStorage.removeItem(LICENSE_CACHE_KEY); render(); });
}

addEventListener('popstate', () => render({ announceRoute: true }));
render();
void (async () => {
  const accepted = await acceptLicenseFromUrl();
  const refreshed = accepted ? false : await refreshLicense();
  if (accepted || refreshed) render();
})();

if (!__APP_BUILD__ && 'serviceWorker' in navigator && (location.protocol === 'https:' || ['127.0.0.1', 'localhost'].includes(location.hostname))) {
  addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js'); });
}
