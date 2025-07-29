import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      }
    }

    // Log the error (but not sensitive data in production)
    this.logger.error(
      `HTTP ${status} - ${request.method} ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Don't expose internal errors in production
    if (isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      message = 'Internal server error';
    }

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(isProduction
        ? {}
        : { stack: exception instanceof Error ? exception.stack : undefined }),
    };

    response.status(status).json(errorResponse);
  }
}
