import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottleAuthGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address for tracking
    return req.ips.length ? req.ips[0] : req.ip;
  }

  protected errorMessage =
    'Too many authentication attempts. Please try again later.';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;

    // Only apply throttling to authentication endpoints
    const isAuthEndpoint = 
      (url.includes('/auth/login') && method === 'POST') ||
      (url.includes('/auth/register') && method === 'POST') ||
      (url.includes('/api/auth') && method === 'POST');

    if (!isAuthEndpoint) {
      return true; // Skip throttling for non-auth endpoints
    }

    return super.canActivate(context);
  }
}
