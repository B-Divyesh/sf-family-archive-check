import { app } from '@azure/functions';
import { licenseVerificationLimiter, verifyLicenseRequest } from '../license-verification.js';

app.http('license-verify', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'license/verify',
  handler: (request) => verifyLicenseRequest(request, { limiter: licenseVerificationLimiter })
});
