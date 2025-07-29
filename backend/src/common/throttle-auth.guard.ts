import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottleAuthGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address for tracking
    return req.ips.length ? req.ips[0] : req.ip;
  }

  protected errorMessage = 'Too many authentication attempts. Please try again later.';
} 