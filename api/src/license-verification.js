import { TableClient } from '@azure/data-tables';
import { createHmac } from 'node:crypto';

export const LICENSE_VERIFY_LIMIT = 10;
export const LICENSE_VERIFY_WINDOW_MS = 10 * 60 * 1000;

const PRODUCT = 'family-archive-check';
const UPSTREAM = `https://api.sociobot.in/api/v1/products/${PRODUCT}/verify`;
const RATE_LIMIT_TABLE = 'familyarchivelimits';
const RATE_LIMIT_PARTITION = 'license-verify-v1';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin'
};

function storageStatus(error, status) {
  return error?.statusCode === status || error?.status === status;
}

function rateDecision({ allowed, count, resetAt, limit, now }) {
  return {
    allowed,
    limit,
    remaining: allowed ? Math.max(0, limit - count) : 0,
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    resetAt
  };
}

/**
 * A shared Azure Tables limiter. Table entity ETags make every increment a
 * compare-and-swap, so independently scaled Functions share the same ten
 * request allowance. The table contains an HMAC of the platform address, not
 * the address itself.
 */
export class AzureTableRateLimiter {
  #ready;

  constructor({
    tableClient,
    secret,
    limit = LICENSE_VERIFY_LIMIT,
    windowMs = LICENSE_VERIFY_WINDOW_MS,
    partitionKey = RATE_LIMIT_PARTITION,
    maxRetries = 16
  }) {
    if (!tableClient) throw new Error('A shared Azure Table client is required');
    if (!secret) throw new Error('A rate-limit HMAC secret is required');
    this.tableClient = tableClient;
    this.secret = secret;
    this.limit = limit;
    this.windowMs = windowMs;
    this.partitionKey = partitionKey;
    this.maxRetries = maxRetries;
  }

  async #ensureTable() {
    if (!this.#ready) {
      this.#ready = this.tableClient.createTable().catch((error) => {
        // Concurrent cold starts race to create the table; an existing table
        // is the expected outcome for every request after the first.
        if (storageStatus(error, 409)) return;
        this.#ready = undefined;
        throw error;
      });
    }
    return this.#ready;
  }

  #rowKey(client) {
    return createHmac('sha256', this.secret).update(client).digest('base64url');
  }

  async take(client, now = Date.now()) {
    await this.#ensureTable();
    const partitionKey = this.partitionKey;
    const rowKey = this.#rowKey(client);

    for (let attempt = 0; attempt < this.maxRetries; attempt += 1) {
      let current;
      try {
        current = await this.tableClient.getEntity(partitionKey, rowKey);
      } catch (error) {
        if (!storageStatus(error, 404)) throw error;
      }

      if (!current) {
        const resetAt = now + this.windowMs;
        try {
          await this.tableClient.createEntity({ partitionKey, rowKey, count: 1, resetAt });
          return rateDecision({ allowed: true, count: 1, resetAt, limit: this.limit, now });
        } catch (error) {
          // Another Function won the create race. Read the new entity and
          // retry its conditional increment instead of granting another slot.
          if (storageStatus(error, 409)) continue;
          throw error;
        }
      }

      const count = Number(current.count);
      const resetAt = Number(current.resetAt);
      if (!Number.isFinite(count) || !Number.isFinite(resetAt)) {
        throw new Error('Invalid shared rate-limit entity');
      }

      if (resetAt > now && count >= this.limit) {
        return rateDecision({ allowed: false, count, resetAt, limit: this.limit, now });
      }

      const next = resetAt <= now
        ? { count: 1, resetAt: now + this.windowMs }
        : { count: count + 1, resetAt };

      try {
        await this.tableClient.updateEntity(
          { partitionKey, rowKey, ...next },
          'Replace',
          { etag: current.etag }
        );
        return rateDecision({ allowed: true, ...next, limit: this.limit, now });
      } catch (error) {
        // ETag precondition failures prove another request updated this bucket
        // first. Retry the read and never issue a second allowance.
        if (storageStatus(error, 412) || storageStatus(error, 404)) continue;
        throw error;
      }
    }

    throw new Error('Shared rate-limit contention did not settle');
  }
}

export class UnavailableRateLimiter {
  async take() {
    throw new Error('Shared rate-limit storage is unavailable');
  }
}

export function createLicenseVerificationLimiter(environment = process.env) {
  const connectionString = environment.AzureWebJobsStorage;
  if (!connectionString) return new UnavailableRateLimiter();

  return new AzureTableRateLimiter({
    tableClient: TableClient.fromConnectionString(connectionString, RATE_LIMIT_TABLE),
    // AzureWebJobsStorage is an application secret shared by every Function
    // instance. It is used only as the HMAC key and never written to storage.
    secret: environment.LICENSE_RATE_LIMIT_HMAC_KEY || connectionString
  });
}

export const licenseVerificationLimiter = createLicenseVerificationLimiter();

export function clientAddress(headers) {
  // Azure Functions sets this header at the platform boundary. Do not accept
  // X-Forwarded-For or X-Client-IP: callers can supply both to mint buckets.
  const platformAddress = headers.get('x-azure-clientip')?.trim();
  return platformAddress ? platformAddress.slice(0, 128) : 'unattributed-client';
}

function response(body, status, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, ...headers } });
}

function rateHeaders(decision) {
  return {
    'Retry-After': String(decision.retryAfter),
    'X-RateLimit-Limit': String(decision.limit),
    'X-RateLimit-Remaining': String(decision.remaining),
    'X-RateLimit-Reset': String(Math.ceil(decision.resetAt / 1000))
  };
}

export async function verifyLicenseRequest(request, {
  fetchImpl = fetch,
  limiter = licenseVerificationLimiter,
  now = () => Date.now()
} = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return response({ valid: false, reason: 'method_not_allowed' }, 405, { Allow: 'GET, OPTIONS' });
  }

  const url = new URL(request.url);
  const token = url.searchParams.get('license')?.trim();
  if (!token || token.length > 4096) {
    return response({ valid: false, reason: 'missing_license' }, 400);
  }

  let decision;
  try {
    decision = await limiter.take(clientAddress(request.headers), now());
  } catch {
    // A private paid-feature proxy must not fail open if shared storage cannot
    // enforce its documented limit.
    return response({ valid: false, reason: 'unavailable' }, 503);
  }

  if (!decision.allowed) {
    return response(
      { valid: false, reason: 'rate_limited', retry_after_seconds: decision.retryAfter },
      429,
      rateHeaders(decision)
    );
  }

  let upstream;
  try {
    upstream = await fetchImpl(`${UPSTREAM}?license=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000)
    });
  } catch {
    return response({ valid: false, reason: 'unavailable' }, 503, rateHeaders(decision));
  }

  if (upstream.status === 429) {
    // Keep the product response internally consistent. The upstream limit is
    // independent of this per-client allowance and must not replace its retry
    // time with a zero or conflicting value.
    return response(
      { valid: false, reason: 'rate_limited', retry_after_seconds: decision.retryAfter },
      429,
      rateHeaders(decision)
    );
  }

  if (!upstream.ok) {
    return response({ valid: false, reason: 'unavailable' }, 503, rateHeaders(decision));
  }

  try {
    const payload = await upstream.json();
    if (typeof payload?.valid !== 'boolean') throw new Error('Unexpected license response');
    return response({
      valid: payload.valid,
      reason: typeof payload.reason === 'string' ? payload.reason : (payload.valid ? 'ok' : 'invalid'),
      expires_at: payload.expires_at ?? null
    }, 200, rateHeaders(decision));
  } catch {
    return response({ valid: false, reason: 'unavailable' }, 503, rateHeaders(decision));
  }
}
