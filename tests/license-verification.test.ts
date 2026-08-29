import { describe, expect, it } from 'vitest';
import {
  AzureTableRateLimiter,
  LICENSE_VERIFY_LIMIT,
  LICENSE_VERIFY_WINDOW_MS,
  clientAddress,
  verifyLicenseRequest
} from '../api/src/license-verification.js';

const endpoint = 'https://family-archive-check.sociobot.in/api/license/verify';
const platformClient = '203.0.113.42';

function request(token: string, headers: Record<string, string> = {}) {
  return new Request(`${endpoint}?license=${encodeURIComponent(token)}`, {
    headers: { 'x-azure-clientip': platformClient, ...headers }
  });
}

function validLicenseResponse() {
  return new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function storageError(statusCode: number) {
  return Object.assign(new Error(`Storage ${statusCode}`), { statusCode });
}

/**
 * Matches the Azure Tables operations used by the production limiter. Each
 * operation crosses a microtask boundary so the tests exercise create and ETag
 * races just like separate Function instances using the same table.
 */
class SharedFakeTableClient {
  private tableExists = false;
  private entities = new Map<string, { count: number; resetAt: number; etag: string }>();

  async createTable() {
    await Promise.resolve();
    if (this.tableExists) throw storageError(409);
    this.tableExists = true;
  }

  async getEntity(partitionKey: string, rowKey: string) {
    await Promise.resolve();
    const entity = this.entities.get(`${partitionKey}/${rowKey}`);
    if (!entity) throw storageError(404);
    return { partitionKey, rowKey, ...entity };
  }

  async createEntity(entity: { partitionKey: string; rowKey: string; count: number; resetAt: number }) {
    await Promise.resolve();
    const key = `${entity.partitionKey}/${entity.rowKey}`;
    if (this.entities.has(key)) throw storageError(409);
    this.entities.set(key, { count: entity.count, resetAt: entity.resetAt, etag: '1' });
  }

  async updateEntity(
    entity: { partitionKey: string; rowKey: string; count: number; resetAt: number },
    mode: string,
    options: { etag?: string }
  ) {
    await Promise.resolve();
    expect(mode).toBe('Replace');
    const key = `${entity.partitionKey}/${entity.rowKey}`;
    const current = this.entities.get(key);
    if (!current) throw storageError(404);
    if (current.etag !== options.etag) throw storageError(412);
    this.entities.set(key, {
      count: entity.count,
      resetAt: entity.resetAt,
      etag: String(Number(current.etag) + 1)
    });
  }

  rowKeys() {
    return [...this.entities.keys()];
  }
}

function sharedLimiter(tableClient: SharedFakeTableClient) {
  return new AzureTableRateLimiter({ tableClient, secret: 'test-only-shared-secret' });
}

describe('product license verification API', () => {
  it('@claim:license-rate-limit shares one ten-request allowance across separate connections and concurrent Function instances', async () => {
    const now = 1_700_000_000_000;
    let forwarded = 0;
    const fetchImpl: typeof fetch = async () => {
      forwarded += 1;
      return validLicenseResponse();
    };

    const sequentialTable = new SharedFakeTableClient();
    const sequential = [];
    // Each call has its own limiter instance, modelling different Azure
    // Functions processes reached through ordinary independent connections.
    for (let attempt = 0; attempt < LICENSE_VERIFY_LIMIT; attempt += 1) {
      sequential.push(await verifyLicenseRequest(
        request(`sequential-license-${attempt}`, { 'x-forwarded-for': `198.51.100.${attempt}` }),
        { limiter: sharedLimiter(sequentialTable), fetchImpl, now: () => now }
      ));
    }
    const eleventh = await verifyLicenseRequest(
      request('sequential-over-limit', { 'x-forwarded-for': '198.51.100.250' }),
      { limiter: sharedLimiter(sequentialTable), fetchImpl, now: () => now }
    );
    expect(sequential.map((response) => response.status)).toEqual(Array(LICENSE_VERIFY_LIMIT).fill(200));
    expect(eleventh.status).toBe(429);

    const concurrentTable = new SharedFakeTableClient();
    const concurrent = await Promise.all(
      Array.from({ length: LICENSE_VERIFY_LIMIT + 8 }, (_, attempt) => verifyLicenseRequest(
        request(`license-${attempt}`, { 'x-forwarded-for': `198.51.100.${attempt}` }),
        { limiter: sharedLimiter(concurrentTable), fetchImpl, now: () => now }
      ))
    );

    expect(concurrent.filter((response) => response.status === 200)).toHaveLength(LICENSE_VERIFY_LIMIT);
    expect(concurrent.filter((response) => response.status === 429)).toHaveLength(8);
    expect(forwarded).toBe(LICENSE_VERIFY_LIMIT * 2);

    for (const response of [eleventh, ...concurrent.filter((candidate) => candidate.status === 429)]) {
      const body = await response.json() as { retry_after_seconds: number };
      expect(response.headers.get('Retry-After')).toBe(String(LICENSE_VERIFY_WINDOW_MS / 1000));
      expect(body.retry_after_seconds).toBe(LICENSE_VERIFY_WINDOW_MS / 1000);
      expect(response.headers.get('X-RateLimit-Limit')).toBe(String(LICENSE_VERIFY_LIMIT));
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    }

    // The client address never appears in shared storage; the key is HMACed.
    expect(sequentialTable.rowKeys().join('\n')).not.toContain(platformClient);
  });

  it('does not let X-Forwarded-For or X-Client-IP choose a rate-limit identity', () => {
    const headers = new Headers({
      'x-azure-clientip': '2001:db8::42',
      'x-forwarded-for': '198.51.100.41',
      'x-client-ip': '198.51.100.42'
    });
    expect(clientAddress(headers)).toBe('2001:db8::42');
    expect(clientAddress(new Headers({ 'x-forwarded-for': '198.51.100.99' }))).toBe('unattributed-client');
  });

  it('@claim:license-privacy forwards only the pasted token to Sociobot', async () => {
    let upstreamUrl = '';
    let upstreamOptions: RequestInit | undefined;
    const response = await verifyLicenseRequest(request('private token'), {
      limiter: sharedLimiter(new SharedFakeTableClient()),
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

  it('fails closed when shared storage cannot enforce the product limit', async () => {
    let forwarded = false;
    const unavailable = {
      take: async () => {
        throw new Error('storage unavailable');
      }
    };
    const response = await verifyLicenseRequest(request('private token'), {
      limiter: unavailable,
      fetchImpl: async () => {
        forwarded = true;
        return validLicenseResponse();
      }
    });

    expect(response.status).toBe(503);
    expect(forwarded).toBe(false);
  });

  it('keeps a positive Retry-After header and JSON body aligned when Sociobot throttles', async () => {
    const response = await verifyLicenseRequest(request('private token'), {
      limiter: sharedLimiter(new SharedFakeTableClient()),
      now: () => 1_700_000_000_000,
      fetchImpl: async () => new Response('upstream limit', {
        status: 429,
        headers: { 'Retry-After': '0' }
      })
    });

    expect(response.status).toBe(429);
    const body = await response.json() as { retry_after_seconds: number };
    expect(response.headers.get('Retry-After')).toBe(String(body.retry_after_seconds));
    expect(body.retry_after_seconds).toBeGreaterThan(0);
  });

  it('resets a client bucket after its documented ten-minute window', async () => {
    const limiter = new AzureTableRateLimiter({
      tableClient: new SharedFakeTableClient(),
      secret: 'test-only-shared-secret',
      limit: 1,
      windowMs: 600_000
    });
    const fetchImpl: typeof fetch = async () => validLicenseResponse();
    const first = await verifyLicenseRequest(request('one'), { limiter, fetchImpl, now: () => 10_000 });
    const blocked = await verifyLicenseRequest(request('two'), { limiter, fetchImpl, now: () => 10_000 });
    const reset = await verifyLicenseRequest(request('three'), { limiter, fetchImpl, now: () => 610_000 });
    expect([first.status, blocked.status, reset.status]).toEqual([200, 429, 200]);
  });
});
