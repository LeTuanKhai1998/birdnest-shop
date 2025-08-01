import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PerformanceService } from './performance.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  constructor(private readonly performanceService: PerformanceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = request.method;
    const url = request.url;
    // const userAgent = request.get('User-Agent') || 'Unknown'; // Unused variable

    this.logger.debug(`Request started: ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = response.statusCode;

          // Record performance metric
          this.performanceService.recordMetric({
            endpoint: url,
            method,
            responseTime,
            statusCode,
          });

          this.logger.debug(
            `Request completed: ${method} ${url} - ${statusCode} (${responseTime}ms)`,
          );

          // Log slow requests
          if (responseTime > 1000) {
            this.logger.warn(
              `Slow request: ${method} ${url} took ${responseTime}ms`,
            );
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = error.status || 500;

          // Record performance metric for errors too
          this.performanceService.recordMetric({
            endpoint: url,
            method,
            responseTime,
            statusCode,
          });

          this.logger.error(
            `Request failed: ${method} ${url} - ${statusCode} (${responseTime}ms)`,
            error.stack,
          );
        },
      }),
    );
  }
}
