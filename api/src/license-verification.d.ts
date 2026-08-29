export const LICENSE_VERIFY_LIMIT: number;
export const LICENSE_VERIFY_WINDOW_MS: number;

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
  resetAt: number;
};

export type RateLimiter = {
  take(client: string, now?: number): Promise<RateLimitDecision>;
};

export class AzureTableRateLimiter implements RateLimiter {
  constructor(options: {
    tableClient: unknown;
    secret: string;
    limit?: number;
    windowMs?: number;
    partitionKey?: string;
    maxRetries?: number;
  });
  take(client: string, now?: number): Promise<RateLimitDecision>;
}

export class UnavailableRateLimiter implements RateLimiter {
  take(client: string, now?: number): Promise<RateLimitDecision>;
}

export const licenseVerificationLimiter: RateLimiter;
export function createLicenseVerificationLimiter(environment?: NodeJS.ProcessEnv): RateLimiter;
export function clientAddress(headers: Headers): string;
export function verifyLicenseRequest(request: Request, options?: {
  fetchImpl?: typeof fetch;
  limiter?: RateLimiter;
  now?: () => number;
}): Promise<Response>;
