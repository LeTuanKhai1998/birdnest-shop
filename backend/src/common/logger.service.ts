import { Injectable, Logger, LoggerService } from '@nestjs/common';

export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

export interface UserEvent {
  userId?: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  metadata?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly logger = new Logger(StructuredLoggerService.name);
  private readonly userEvents: UserEvent[] = [];

  log(message: string, context?: LogContext): void {
    const structuredLog = this.createStructuredLog('info', message, context);
    this.logger.log(JSON.stringify(structuredLog));
  }

  error(message: string, trace?: string, context?: LogContext): void {
    const structuredLog = this.createStructuredLog('error', message, context, trace);
    this.logger.error(JSON.stringify(structuredLog));
  }

  warn(message: string, context?: LogContext): void {
    const structuredLog = this.createStructuredLog('warn', message, context);
    this.logger.warn(JSON.stringify(structuredLog));
  }

  debug(message: string, context?: LogContext): void {
    const structuredLog = this.createStructuredLog('debug', message, context);
    this.logger.debug(JSON.stringify(structuredLog));
  }

  verbose(message: string, context?: LogContext): void {
    const structuredLog = this.createStructuredLog('verbose', message, context);
    this.logger.verbose(JSON.stringify(structuredLog));
  }

  trackUserEvent(event: UserEvent): void {
    this.userEvents.push(event);
    
    const logLevel = event.status === 'success' ? 'info' : 'warn';
    const message = `User Event: ${event.action} on ${event.resource}`;
    
    const context: LogContext = {
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      metadata: {
        status: event.status,
        ...event.metadata,
      },
    };

    this[logLevel](message, context);
  }

  getRecentUserEvents(limit: number = 100): UserEvent[] {
    return this.userEvents.slice(-limit);
  }

  getEventsByUser(userId: string, limit: number = 50): UserEvent[] {
    return this.userEvents
      .filter(event => event.userId === userId)
      .slice(-limit);
  }

  getEventsByAction(action: string, limit: number = 50): UserEvent[] {
    return this.userEvents
      .filter(event => event.action === action)
      .slice(-limit);
  }

  clearEvents(): void {
    this.userEvents.length = 0;
  }

  private createStructuredLog(
    level: string,
    message: string,
    context?: LogContext,
    trace?: string,
  ): Record<string, any> {
    const log: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'birdnest-backend',
      environment: process.env.NODE_ENV || 'development',
    };

    if (context) {
      if (context.userId) log.userId = context.userId;
      if (context.requestId) log.requestId = context.requestId;
      if (context.action) log.action = context.action;
      if (context.resource) log.resource = context.resource;
      if (context.metadata) log.metadata = context.metadata;
    }

    if (trace) {
      log.trace = trace;
    }

    return log;
  }

  // Performance logging methods
  logRequestStart(method: string, url: string, userId?: string, requestId?: string): void {
    this.log(`Request started: ${method} ${url}`, {
      userId,
      requestId,
      action: 'request_start',
      resource: url,
      metadata: { method },
    });
  }

  logRequestEnd(method: string, url: string, statusCode: number, duration: number, userId?: string, requestId?: string): void {
    this.log(`Request completed: ${method} ${url} - ${statusCode} (${duration}ms)`, {
      userId,
      requestId,
      action: 'request_end',
      resource: url,
      metadata: { method, statusCode, duration },
    });
  }

  // Business event logging methods
  logOrderCreated(orderId: string, userId?: string, guestEmail?: string): void {
    this.trackUserEvent({
      userId,
      action: 'order_created',
      resource: 'order',
      status: 'success',
      metadata: { orderId, guestEmail },
      timestamp: new Date(),
    });
  }

  logOrderStatusChanged(orderId: string, oldStatus: string, newStatus: string, userId?: string): void {
    this.trackUserEvent({
      userId,
      action: 'order_status_changed',
      resource: 'order',
      status: 'success',
      metadata: { orderId, oldStatus, newStatus },
      timestamp: new Date(),
    });
  }

  logPaymentSuccess(orderId: string, amount: number, paymentMethod: string, userId?: string): void {
    this.trackUserEvent({
      userId,
      action: 'payment_success',
      resource: 'payment',
      status: 'success',
      metadata: { orderId, amount, paymentMethod },
      timestamp: new Date(),
    });
  }

  logPaymentFailure(orderId: string, error: string, userId?: string): void {
    this.trackUserEvent({
      userId,
      action: 'payment_failure',
      resource: 'payment',
      status: 'failure',
      metadata: { orderId, error },
      timestamp: new Date(),
    });
  }

  logUserLogin(userId: string, method: string): void {
    this.trackUserEvent({
      userId,
      action: 'user_login',
      resource: 'auth',
      status: 'success',
      metadata: { method },
      timestamp: new Date(),
    });
  }

  logUserLogout(userId: string): void {
    this.trackUserEvent({
      userId,
      action: 'user_logout',
      resource: 'auth',
      status: 'success',
      timestamp: new Date(),
    });
  }

  logProductView(productId: string, userId?: string): void {
    this.trackUserEvent({
      userId,
      action: 'product_view',
      resource: 'product',
      status: 'success',
      metadata: { productId },
      timestamp: new Date(),
    });
  }

  logSearchQuery(query: string, resultsCount: number, userId?: string): void {
    this.trackUserEvent({
      userId,
      action: 'search_query',
      resource: 'search',
      status: 'success',
      metadata: { query, resultsCount },
      timestamp: new Date(),
    });
  }
} 