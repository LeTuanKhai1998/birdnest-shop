import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../common/prisma.service';
import {
  CreateNotificationDto,
  NotificationType,
  RecipientType,
} from './dto/create-notification.dto';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createNotificationDto: CreateNotificationDto = {
        title: 'Test Notification',
        body: 'Test body',
        type: NotificationType.ORDER,
        recipientType: RecipientType.USER,
        userId: 'user-123',
      };

      const expectedNotification = {
        id: 'notification-123',
        ...createNotificationDto,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockPrismaService.notification.create.mockResolvedValue(
        expectedNotification,
      );

      const result = await service.create(createNotificationDto);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedNotification);
    });
  });

  describe('findAll', () => {
    it('should return notifications for a user', async () => {
      const userId = 'user-123';
      const isAdmin = false;
      const expectedNotifications = [
        {
          id: 'notification-1',
          title: 'User Notification',
          type: NotificationType.ORDER,
          recipientType: RecipientType.USER,
          userId: 'user-123',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(
        expectedNotifications,
      );

      const result = await service.findAll(userId, isAdmin);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 'user-123' },
            { userId: null, recipientType: RecipientType.USER },
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
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedNotifications);
    });

    it('should return notifications for an admin', async () => {
      const userId = 'admin-123';
      const isAdmin = true;

      mockPrismaService.notification.findMany.mockResolvedValue([]);

      await service.findAll(userId, isAdmin);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 'admin-123' },
            { userId: null, recipientType: RecipientType.ADMIN },
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findUnreadCount', () => {
    it('should return unread count for a user', async () => {
      const userId = 'user-123';
      const isAdmin = false;
      const expectedCount = 5;

      mockPrismaService.notification.count.mockResolvedValue(expectedCount);

      const result = await service.findUnreadCount(userId, isAdmin);

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: {
          isRead: false,
          OR: [
            { userId: 'user-123' },
            { userId: null, recipientType: RecipientType.USER },
          ],
        },
      });
      expect(result).toBe(expectedCount);
    });
  });

  describe('findOne', () => {
    it('should return a notification if found', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const isAdmin = false;
      const expectedNotification = {
        id: 'notification-123',
        title: 'Test Notification',
        type: NotificationType.ORDER,
        recipientType: RecipientType.USER,
        userId: 'user-123',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notification.findFirst.mockResolvedValue(
        expectedNotification,
      );

      const result = await service.findOne(id, userId, isAdmin);

      expect(mockPrismaService.notification.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'notification-123',
          OR: [
            { userId: 'user-123' },
            { userId: null, recipientType: RecipientType.USER },
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
      expect(result).toEqual(expectedNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const isAdmin = false;

      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.findOne(id, userId, isAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const isAdmin = false;
      const existingNotification = {
        id: 'notification-123',
        title: 'Test Notification',
        isRead: false,
      };
      const updatedNotification = {
        ...existingNotification,
        isRead: true,
      };

      mockPrismaService.notification.findFirst.mockResolvedValue(
        existingNotification,
      );
      mockPrismaService.notification.update.mockResolvedValue(
        updatedNotification,
      );

      const result = await service.markAsRead(id, userId, isAdmin);

      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: 'notification-123' },
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
      expect(result).toEqual(updatedNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-123';
      const isAdmin = false;
      const expectedResult = { count: 5 };

      mockPrismaService.notification.updateMany.mockResolvedValue(
        expectedResult,
      );

      const result = await service.markAllAsRead(userId, isAdmin);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: {
          isRead: false,
          OR: [
            { userId: 'user-123' },
            { userId: null, recipientType: RecipientType.USER },
          ],
        },
        data: { isRead: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      const id = 'notification-123';
      const userId = 'user-123';
      const isAdmin = false;
      const existingNotification = {
        id: 'notification-123',
        title: 'Test Notification',
      };

      mockPrismaService.notification.findFirst.mockResolvedValue(
        existingNotification,
      );
      mockPrismaService.notification.delete.mockResolvedValue(
        existingNotification,
      );

      const result = await service.remove(id, userId, isAdmin);

      expect(mockPrismaService.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notification-123' },
      });
      expect(result).toEqual(existingNotification);
    });
  });

  describe('helper methods', () => {
    it('should create order notification', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';
      const status = 'shipped';

      mockPrismaService.notification.create.mockResolvedValue({});

      await service.createOrderNotification(userId, orderId, status);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          title: 'Order Update',
          body: 'Your order #order-123 has been shipped',
          type: NotificationType.ORDER,
          recipientType: RecipientType.USER,
          userId: 'user-123',
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
    });

    it('should create stock notification', async () => {
      const productName = 'Test Product';
      const currentStock = 5;

      mockPrismaService.notification.create.mockResolvedValue({});

      await service.createStockNotification(productName, currentStock);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          title: 'Low Stock Alert',
          body: 'Test Product is running low on stock (5 remaining)',
          type: NotificationType.STOCK,
          recipientType: RecipientType.ADMIN,
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
    });

    it('should create payment notification', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';
      const status = 'completed';

      mockPrismaService.notification.create.mockResolvedValue({});

      await service.createPaymentNotification(userId, orderId, status);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          title: 'Payment completed',
          body: 'Payment for order #order-123 has been completed',
          type: NotificationType.PAYMENT,
          recipientType: RecipientType.USER,
          userId: 'user-123',
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
    });

    it('should create promotion notification', async () => {
      const title = 'Special Offer';
      const body = 'Get 20% off on all products';

      mockPrismaService.notification.create.mockResolvedValue({});

      await service.createPromotionNotification(title, body);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          title: 'Special Offer',
          body: 'Get 20% off on all products',
          type: NotificationType.PROMOTION,
          recipientType: RecipientType.USER,
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
    });
  });
});
