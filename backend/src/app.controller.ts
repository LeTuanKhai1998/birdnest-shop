import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PerformanceService } from './common/performance.service';
import { CacheService } from './common/cache.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly performanceService: PerformanceService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('performance')
  getPerformanceStats(): any {
    return {
      performance: this.performanceService.getStats(),
      slowestEndpoints: this.performanceService.getSlowestEndpoints(5),
      cache: this.cacheService.getStats(),
    };
  }
}
