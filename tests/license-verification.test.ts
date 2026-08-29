import { describe, expect, it } from 'vitest';
import {
  LICENSE_VERIFY_LIMIT,
  LICENSE_VERIFY_WINDOW_MS,
  PerClientRateLimiter,
  verifyLicenseRequest
} from '../api/src/license-verification.js';

const endpoint = 'https://family-archive-check.sociobot.in/api/license/verify';

function request(token: string, client = '203.0.113.42') {
  return new Request(`${endpoint}?license=${encodeURIComponent(token)}`, {
    headers: { 'x-forwarded-for': client }
  });
}

function validLicenseResponse() {
  return new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('product license verification API', () => {
  it('@claim:license-rate-limit allows the documented ten attempts, then returns 429 and Retry-After for that client', async () => {
    const limiter = new PerClientRateLimiter();
    const now = 1_700_000_000_000;
    let forwarded = 0;
    const fetchImpl: typeof fetch = async () => {
      forwarded += 1;
      return validLicenseResponse();
    };

    for (let attempt = 0; attempt < LICENSE_VERIFY_LIMIT; attempt += 1) {
      const result = await verifyLicenseRequest(request(`license-${attempt}`), { limiter, fetchImpl, now: () => now });
      expect(result.status).toBe(200);
    }

    const limited = await verifyLicenseRequest(request('license-over-limit'), { limiter, fetchImpl, now: () => now });
    expect(forwarded).toBe(LICENSE_VERIFY_LIMIT);
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBe(String(LICENSE_VERIFY_WINDOW_MS / 1000));
    expect(limited.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(limited.headers.get('X-RateLimit-Limit')).toBe(String(LICENSE_VERIFY_LIMIT));
    expect(limited.headers.get('X-RateLimit-Remaining')).toBe('0');
    await expect(limited.json()).resolves.toMatchObject({
      valid: false,
      reason: 'rate_limited',
      retry_after_seconds: LICENSE_VERIFY_WINDOW_MS / 1000
    });
  });

  it('@claim:license-privacy forwards only the pasted token to Sociobot', async () => {
    let upstreamUrl = '';
    let upstreamOptions: RequestInit | undefined;
    const response = await verifyLicenseRequest(request('private token'), {
      limiter: new PerClientRateLimiter(),
      now: () => 1_700_000_000_000,
      fetchImpl: async (url, options) => {
        upstreamUrl = String(url);
        upstreamOptions = options;
        return validLicenseResponse();
      }
    });

    expect(response.status).toBe(200);
    const forwarded = new URL(upstreamUrl);
    expect(forwarded.origin).toBe('https://api.sociobot.in');
    expect(forwarded.pathname).toBe('/api/v1/products/family-archive-check/verify');
    expect([...forwarded.searchParams.entries()]).toEqual([['license', 'private token']]);
    expect(upstreamOptions).toMatchObject({ method: 'GET', headers: { Accept: 'application/json' } });
    expect(upstreamOptions?.body).toBeUndefined();
  });

  it('uses a separate bucket for a different client and resets after ten minutes', async () => {
    const limiter = new PerClientRateLimiter(1, 1_000);
    const fetchImpl: typeof fetch = async () => validLicenseResponse();
    const first = await verifyLicenseRequest(request('one', '203.0.113.1'), { limiter, fetchImpl, now: () => 10_000 });
    const blocked = await verifyLicenseRequest(request('two', '203.0.113.1'), { limiter, fetchImpl, now: () => 10_000 });
    const otherClient = await verifyLicenseRequest(request('three', '203.0.113.2'), { limiter, fetchImpl, now: () => 10_000 });
    const reset = await verifyLicenseRequest(request('four', '203.0.113.1'), { limiter, fetchImpl, now: () => 11_000 });
    expect([first.status, blocked.status, otherClient.status, reset.status]).toEqual([200, 429, 200, 200]);
  });
});
