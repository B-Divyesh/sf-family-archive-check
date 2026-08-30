import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('configured production build', () => {
  it('builds both deploy and desktop frontends from the package script', () => {
    const result = spawnSync('npm', ['run', 'build'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { ...process.env, CI: 'true' }
    });

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(existsSync('dist/site/index.html')).toBe(true);
    expect(existsSync('dist/site/staticwebapp.config.json')).toBe(true);
    expect(existsSync('dist/app/index.html')).toBe(true);

    const siteHtml = readFileSync('dist/site/index.html', 'utf8');
    const appHtml = readFileSync('dist/app/index.html', 'utf8');
    expect(siteHtml).toContain('<div id="app"></div>');
    expect(appHtml).toContain('<div id="app"></div>');
  }, 60_000);

  it('keeps the static build tool in production dependencies', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(packageJson.dependencies.vite).toBe('7.3.6');
    expect(packageJson.engines.node).toBe('>=22.12 <23');
  });
});
