import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class IdGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a human-readable ID with prefix and sequential number
   */
  async generateReadableId(entityType: 'PRODUCT' | 'ORDER' | 'USER' | 'CATEGORY' | 'REVIEW'): Promise<string> {
    const prefix = this.getPrefix(entityType);
    const currentYear = new Date().getFullYear();
    
    // Get the latest ID for this entity type and year
    const latestId = await this.getLatestId(entityType, currentYear);
    const nextNumber = latestId + 1;
    
    // Format: PREFIX-YEAR-NUMBER (e.g., PROD-2024-001)
    return `${prefix}-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Get the appropriate prefix for each entity type
   */
  private getPrefix(entityType: string): string {
    const prefixes = {
      'PRODUCT': 'PROD',
      'ORDER': 'ORD',
      'USER': 'USR',
      'CATEGORY': 'CAT',
      'REVIEW': 'REV',
    };
    return prefixes[entityType] || 'ID';
  }

  /**
   * Get the latest sequential number for an entity type and year
   */
  private async getLatestId(entityType: string, year: number): Promise<number> {
    let latestId = 0;

    switch (entityType) {
      case 'PRODUCT':
        const latestProduct = await this.prisma.product.findFirst({
          where: {
            readableId: {
              startsWith: `PROD-${year}-`
            }
          },
          orderBy: {
            readableId: 'desc'
          },
          select: { readableId: true }
        });
        if (latestProduct?.readableId) {
          const match = latestProduct.readableId.match(/PROD-\d{4}-(\d+)/);
          latestId = match ? parseInt(match[1]) : 0;
        }
        break;

      case 'ORDER':
        const latestOrder = await this.prisma.order.findFirst({
          where: {
            readableId: {
              startsWith: `ORD-${year}-`
            }
          },
          orderBy: {
            readableId: 'desc'
          },
          select: { readableId: true }
        });
        if (latestOrder?.readableId) {
          const match = latestOrder.readableId.match(/ORD-\d{4}-(\d+)/);
          latestId = match ? parseInt(match[1]) : 0;
        }
        break;

      case 'USER':
        const latestUser = await this.prisma.user.findFirst({
          where: {
            readableId: {
              startsWith: `USR-${year}-`
            }
          },
          orderBy: {
            readableId: 'desc'
          },
          select: { readableId: true }
        });
        if (latestUser?.readableId) {
          const match = latestUser.readableId.match(/USR-\d{4}-(\d+)/);
          latestId = match ? parseInt(match[1]) : 0;
        }
        break;

      case 'CATEGORY':
        const latestCategory = await this.prisma.category.findFirst({
          where: {
            readableId: {
              startsWith: `CAT-${year}-`
            }
          },
          orderBy: {
            readableId: 'desc'
          },
          select: { readableId: true }
        });
        if (latestCategory?.readableId) {
          const match = latestCategory.readableId.match(/CAT-\d{4}-(\d+)/);
          latestId = match ? parseInt(match[1]) : 0;
        }
        break;

      case 'REVIEW':
        const latestReview = await this.prisma.review.findFirst({
          where: {
            readableId: {
              startsWith: `REV-${year}-`
            }
          },
          orderBy: {
            readableId: 'desc'
          },
          select: { readableId: true }
        });
        if (latestReview?.readableId) {
          const match = latestReview.readableId.match(/REV-\d{4}-(\d+)/);
          latestId = match ? parseInt(match[1]) : 0;
        }
        break;
    }

    return latestId;
  }

  /**
   * Generate a short hash ID (6-8 characters)
   */
  generateShortId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a timestamp-based ID
   */
  generateTimestampId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }

  /**
   * Extract readable ID from a full ID string
   */
  extractReadableId(fullId: string): string {
    // If it's already a readable ID, return as is
    if (fullId.match(/^[A-Z]{3,4}-\d{4}-\d{3}$/)) {
      return fullId;
    }
    
    // If it's a CUID, return the last 8 characters for display
    if (fullId.length > 20) {
      return fullId.slice(-8).toUpperCase();
    }
    
    return fullId;
  }

  /**
   * Validate if an ID is a readable ID format
   */
  isValidReadableId(id: string): boolean {
    return /^[A-Z]{3,4}-\d{4}-\d{3}$/.test(id);
  }
} 