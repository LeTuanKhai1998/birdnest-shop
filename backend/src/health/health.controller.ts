import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Application health check
      () => Promise.resolve({
        application: {
          status: 'up',
          details: {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0',
          },
        },
      } as HealthIndicatorResult),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => Promise.resolve({
        application: {
          status: 'up',
          details: {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
          },
        },
      } as HealthIndicatorResult),
    ]);
  }

  @Get('live')
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => Promise.resolve({
        application: {
          status: 'up',
          details: {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
          },
        },
      } as HealthIndicatorResult),
    ]);
  }
} 