import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SoldCountService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate sold count for a product based on completed orders
   */
  async calculateSoldCount(productId: string): Promise<number> {
    const result = await this.prisma.orderItem.aggregate({
      where: {
        productId: productId,
        order: {
          status: {
            in: ['PAID', 'SHIPPED', 'DELIVERED']
          }
        }
      },
      _sum: {
        quantity: true
      }
    });

    return result._sum.quantity || 0;
  }

  /**
   * Update sold count for a specific product
   */
  async updateSoldCount(productId: string): Promise<void> {
    const soldCount = await this.calculateSoldCount(productId);
    
    await this.prisma.product.update({
      where: { id: productId },
      data: { soldCount }
    });
  }

  /**
   * Update sold count for all products
   */
  async updateAllSoldCounts(): Promise<void> {
    const products = await this.prisma.product.findMany({
      select: { id: true }
    });

    for (const product of products) {
      await this.updateSoldCount(product.id);
    }
  }

  /**
   * Get sold count for a product (cached value)
   */
  async getSoldCount(productId: string): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { soldCount: true }
    });

    return product?.soldCount || 0;
  }

  /**
   * Update sold count when an order is completed
   */
  async onOrderCompleted(orderId: string): Promise<void> {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      select: { productId: true }
    });

    // Update sold count for each product in the order
    for (const item of orderItems) {
      await this.updateSoldCount(item.productId);
    }
  }
} 