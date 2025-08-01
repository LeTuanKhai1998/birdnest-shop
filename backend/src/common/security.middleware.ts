/* eslint-disable no-control-regex */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      this.sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          obj[key] = this.sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.sanitizeObject(obj[key]);
        }
      }
    }
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    return (
      str
        // Remove null bytes and control characters except newlines and tabs
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        // Trim whitespace
        .trim()
    );
  }
}
