export const LICENSE_VERIFY_LIMIT = 10;
export const LICENSE_VERIFY_WINDOW_MS = 10 * 60 * 1000;

const PRODUCT = 'family-archive-check';
const UPSTREAM = `https://api.sociobot.in/api/v1/products/${PRODUCT}/verify`;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Vary': 'Origin'
};

export class PerClientRateLimiter {
  #buckets = new Map();

  constructor(limit = LICENSE_VERIFY_LIMIT, windowMs = LICENSE_VERIFY_WINDOW_MS) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  take(client, now = Date.now()) {
    const current = this.#buckets.get(client);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + this.windowMs }
      : current;
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    if (bucket.count >= this.limit) {
      this.#buckets.set(client, bucket);
      return { allowed: false, limit: this.limit, remaining: 0, retryAfter, resetAt: bucket.resetAt };
    }

    bucket.count += 1;
    this.#buckets.set(client, bucket);
    return { allowed: true, limit: this.limit, remaining: this.limit - bucket.count, retryAfter, resetAt: bucket.resetAt };
  }
}

export const licenseVerificationLimiter = new PerClientRateLimiter();

export function clientAddress(headers) {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const direct = headers.get('x-azure-clientip')?.trim() || headers.get('x-client-ip')?.trim();
  const value = forwarded || direct || 'unknown-client';
  return value.slice(0, 128);
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

  const decision = limiter.take(clientAddress(request.headers), now());
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
    const retryAfter = upstream.headers.get('retry-after') ?? String(decision.retryAfter);
    return response(
      { valid: false, reason: 'rate_limited', retry_after_seconds: Number(retryAfter) || decision.retryAfter },
      429,
      { ...rateHeaders(decision), 'Retry-After': retryAfter }
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
