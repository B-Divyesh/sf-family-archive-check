export const LICENSE_VERIFY_LIMIT: number;
export const LICENSE_VERIFY_WINDOW_MS: number;

export class PerClientRateLimiter {
  constructor(limit?: number, windowMs?: number);
  take(client: string, now?: number): {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfter: number;
    resetAt: number;
  };
}

export const licenseVerificationLimiter: PerClientRateLimiter;
export function clientAddress(headers: Headers): string;
export function verifyLicenseRequest(request: Request, options?: {
  fetchImpl?: typeof fetch;
  limiter?: PerClientRateLimiter;
  now?: () => number;
}): Promise<Response>;
