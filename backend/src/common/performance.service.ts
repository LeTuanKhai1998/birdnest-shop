import { Injectable, Logger } from '@nestjs/common';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  timestamp: Date;
  statusCode: number;
}

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowestEndpoint: string;
  fastestEndpoint: string;
  errorRate: number;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private readonly metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow requests
    if (metric.responseTime > 1000) {
      this.logger.warn(
        `Slow request detected: ${metric.method} ${metric.endpoint} took ${metric.responseTime}ms`,
      );
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowestEndpoint: '',
        fastestEndpoint: '',
        errorRate: 0,
      };
    }

    const totalRequests = this.metrics.length;
    const averageResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    
    const slowest = this.metrics.reduce((slowest, current) => 
      current.responseTime > slowest.responseTime ? current : slowest
    );
    
    const fastest = this.metrics.reduce((fastest, current) => 
      current.responseTime < fastest.responseTime ? current : fastest
    );

    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowestEndpoint: `${slowest.method} ${slowest.endpoint}`,
      fastestEndpoint: `${fastest.method} ${fastest.endpoint}`,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * Get metrics for a specific endpoint
   */
  getEndpointStats(endpoint: string, method: string): PerformanceStats {
    const endpointMetrics = this.metrics.filter(
      m => m.endpoint === endpoint && m.method === method
    );

    if (endpointMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowestEndpoint: '',
        fastestEndpoint: '',
        errorRate: 0,
      };
    }

    const totalRequests = endpointMetrics.length;
    const averageResponseTime = endpointMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    
    const slowest = endpointMetrics.reduce((slowest, current) => 
      current.responseTime > slowest.responseTime ? current : slowest
    );
    
    const fastest = endpointMetrics.reduce((fastest, current) => 
      current.responseTime < fastest.responseTime ? current : fastest
    );

    const errorCount = endpointMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowestEndpoint: `${slowest.method} ${slowest.endpoint}`,
      fastestEndpoint: `${fastest.method} ${fastest.endpoint}`,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * Get recent metrics (last N minutes)
   */
  getRecentMetrics(minutes: number = 5): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Clear old metrics (older than N minutes)
   */
  clearOldMetrics(minutes: number = 60): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const initialLength = this.metrics.length;
    
    const filtered = this.metrics.filter(m => m.timestamp > cutoff);
    this.metrics.splice(0, this.metrics.length, ...filtered);
    
    const cleared = initialLength - this.metrics.length;
    if (cleared > 0) {
      this.logger.debug(`Cleared ${cleared} old performance metrics`);
    }
    
    return cleared;
  }

  /**
   * Get top slowest endpoints
   */
  getSlowestEndpoints(limit: number = 10): Array<{ endpoint: string; method: string; avgResponseTime: number; count: number }> {
    const endpointStats = new Map<string, { totalTime: number; count: number }>();

    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || { totalTime: 0, count: 0 };
      endpointStats.set(key, {
        totalTime: existing.totalTime + metric.responseTime,
        count: existing.count + 1,
      });
    });

    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        method: endpoint.split(' ')[0],
        avgResponseTime: Math.round(stats.totalTime / stats.count),
        count: stats.count,
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }
} 