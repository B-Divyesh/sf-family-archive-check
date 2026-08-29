import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

function contrast(hexA: string, hexB: string) {
  const luminance = (hex: string) => {
    const channels = hex.match(/[a-f0-9]{2}/gi)!.map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const [lighter, darker] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('release policies', () => {
  it('keeps the package, desktop, and visible release versions aligned', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const tauri = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
    const cargo = readFileSync('src-tauri/Cargo.toml', 'utf8');
    const app = readFileSync('src/main.ts', 'utf8');
    expect(tauri.version).toBe(packageJson.version);
    expect(cargo).toMatch(new RegExp(`^version = "${packageJson.version.replaceAll('.', '\\.')}"$`, 'm'));
    expect(app).toContain(`Version ${packageJson.version}`);
  });

  it('@claim:installer-checksum verifies each installer before saving it', () => {
    const shell = readFileSync('public/install.sh', 'utf8');
    const powershell = readFileSync('public/install.ps1', 'utf8');
    const sandbox = mkdtempSync(join(tmpdir(), 'archive-installer-'));
    const bin = join(sandbox, 'bin');
    const home = join(sandbox, 'home');
    mkdirSync(bin);
    mkdirSync(home);
    const digest = createHash('sha256').update('installer-bytes').digest('hex');
    writeFileSync(join(bin, 'uname'), '#!/bin/sh\n[ "$1" = "-s" ] && echo Linux || echo x86_64\n');
    writeFileSync(join(bin, 'curl'), `#!/bin/sh
out=""
url=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift 2 ;;
    -*) shift ;;
    *) url="$1"; shift ;;
  esac
done
case "$url" in
  *api.github.com*) printf '%s\\n' '{"assets":[' ' {"browser_download_url": "https://example.test/Family.AppImage"},' ' {"browser_download_url": "https://example.test/SHA256SUMS"}' ']}' > "$out" ;;
  *Family.AppImage) printf 'installer-bytes' > "$out" ;;
  *SHA256SUMS) printf '${digest}  Family.AppImage\\n' > "$out" ;;
  *) exit 1 ;;
esac
`);
    chmodSync(join(bin, 'uname'), 0o755);
    chmodSync(join(bin, 'curl'), 0o755);
    try {
      const result = spawnSync('sh', ['public/install.sh'], { encoding: 'utf8', env: { ...process.env, HOME: home, PATH: `${bin}:${process.env.PATH}` } });
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(join(home, 'Downloads', 'Family.AppImage'), 'utf8')).toBe('installer-bytes');
      expect(result.stdout).toContain('Verified and saved Family.AppImage');
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
    expect(shell.indexOf('sha256sum -c')).toBeLessThan(shell.indexOf('mv "$asset"'));
    expect(powershell).toMatch(/Get-FileHash .* -Algorithm SHA256/);
    expect(powershell).toMatch(/if \(\$expected -ne \$actual\).*throw/);
    expect(powershell.indexOf('if ($expected -ne $actual)')).toBeLessThan(powershell.indexOf('Move-Item'));
    expect(existsSync('public/install.ps1')).toBe(true);
  });

  it('serves app routes explicitly, unknown routes as 404, and immutable assets', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8'));
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes).toContainEqual({ route: '/demo', rewrite: '/index.html' });
    expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('keeps result and action text colors at WCAG AA contrast', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    const color = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[a-f0-9]{6})`, 'i'))?.[1];
    const raised = color('raised')!;
    const teal = color('teal')!;
    const coral = color('coral')!;
    const green = color('green')!;
    const muted = color('muted')!;

    for (const [foreground, background] of [[teal, raised], [coral, raised], [muted, raised], ['#ffffff', teal], ['#ffffff', coral], ['#ffffff', green]]) {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
