import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateNotificationDto,
  NotificationType,
  RecipientType,
} from './dto/create-notification.dto';

import { Notification } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        type: createNotificationDto.type,
        recipientType: createNotificationDto.recipientType,
        userId: createNotificationDto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(
    userId: string,
    isAdmin: boolean = false,
  ): Promise<Notification[]> {
    const where: any = {
      OR: [
        { userId: null, recipientType: isAdmin ? 'ADMIN' : 'USER' },
        { userId: userId },
      ],
    };

    const result = await this.prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return result;
  }

  async findUnreadCount(userId: string, isAdmin: boolean) {
    const where: any = {
      isRead: false,
      OR: [
        { userId: userId },
        {
          userId: null,
          recipientType: isAdmin ? RecipientType.ADMIN : RecipientType.USER,
        },
      ],
    };

    return this.prisma.notification.count({ where });
  }

  async findOne(id: string, userId: string, isAdmin: boolean) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { userId: userId },
          {
            userId: null,
            recipientType: isAdmin ? RecipientType.ADMIN : RecipientType.USER,
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string, userId: string, isAdmin: boolean) {
    const notification = await this.findOne(id, userId, isAdmin);

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async markAllAsRead(userId: string, isAdmin: boolean) {
    const where: any = {
      isRead: false,
      OR: [
        { userId: userId },
        {
          userId: null,
          recipientType: isAdmin ? RecipientType.ADMIN : RecipientType.USER,
        },
      ],
    };

    const result = await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return { count: result.count };
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const notification = await this.findOne(id, userId, isAdmin);

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  // Helper methods for creating system notifications
  async createOrderNotification(
    userId: string,
    orderId: string,
    status: string,
  ) {
    return this.create({
      title: `Order Update`,
      body: `Your order #${orderId} has been ${status.toLowerCase()}`,
      type: NotificationType.ORDER,
      recipientType: RecipientType.USER,
      userId,
    });
  }

  async createStockNotification(productName: string, currentStock: number) {
    return this.create({
      title: `Low Stock Alert`,
      body: `${productName} is running low on stock (${currentStock} remaining)`,
      type: NotificationType.STOCK,
      recipientType: RecipientType.ADMIN,
    });
  }

  async createPaymentNotification(
    userId: string,
    orderId: string,
    status: string,
  ) {
    return this.create({
      title: `Payment ${status}`,
      body: `Payment for order #${orderId} has been ${status.toLowerCase()}`,
      type: NotificationType.PAYMENT,
      recipientType: RecipientType.USER,
      userId,
    });
  }

  async createPromotionNotification(title: string, body: string) {
    return this.create({
      title,
      body,
      type: NotificationType.PROMOTION,
      recipientType: RecipientType.USER,
    });
  }

  // Test method for creating sample notifications
  async createTestNotifications(userId: string) {
    const notifications = [
      {
        title: 'Welcome to Birdnest Shop!',
        body: 'Thank you for joining us. Enjoy 10% off your first order with code WELCOME10.',
        type: NotificationType.PROMOTION,
        recipientType: RecipientType.USER,
        userId,
      },
      {
        title: 'Order #12345 Confirmed',
        body: 'Your order has been confirmed and is being processed.',
        type: NotificationType.ORDER,
        recipientType: RecipientType.USER,
        userId,
      },
      {
        title: 'Payment Successful',
        body: 'Payment for order #12345 has been processed successfully.',
        type: NotificationType.PAYMENT,
        recipientType: RecipientType.USER,
        userId,
      },
    ];

    const createdNotifications: any[] = [];
    for (const notification of notifications) {
      const created = await this.create(notification);
      createdNotifications.push(created);
    }

    return createdNotifications;
  }
}
