import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../common/prisma.service';
import { Order, OrderItem, User, Product, Prisma } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    orderItem: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
    product: {
      findUnique: jest.fn(),
    },
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    phone: '1234567890',
    address: 'Test Address',
    isAdmin: false,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    avatar: null,
  };

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test description',
    price: new Prisma.Decimal('1000000'),
    discount: 0,
    quantity: 10,
    categoryId: '1',
    weight: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItem: OrderItem = {
    id: '1',
    orderId: '1',
    productId: '1',
    quantity: 2,
    price: new Prisma.Decimal('1000000'),
  };

  const mockOrder: Order = {
    id: '1',
    userId: '1',
    total: new Prisma.Decimal('2000000'),
    status: 'PENDING',
    paymentMethod: 'COD',
    shippingAddress: 'Test Address',
    guestEmail: null,
    guestName: null,
    guestPhone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all orders without filters', async () => {
      const mockOrdersWithDetails = [
        {
          ...mockOrder,
          user: mockUser,
          orderItems: [mockOrderItem],
        },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrdersWithDetails);

      const result = await service.findAll({});

      expect(result).toEqual(mockOrdersWithDetails);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {},
        skip: undefined,
        take: undefined,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return orders with userId filter', async () => {
      const mockOrdersWithDetails = [
        {
          ...mockOrder,
          user: mockUser,
          orderItems: [mockOrderItem],
        },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrdersWithDetails);

      const result = await service.findAll({ userId: '1' });

      expect(result).toEqual(mockOrdersWithDetails);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        skip: undefined,
        take: undefined,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return orders with status filter', async () => {
      const mockOrdersWithDetails = [
        {
          ...mockOrder,
          user: mockUser,
          orderItems: [mockOrderItem],
        },
      ];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrdersWithDetails);

      const result = await service.findAll({ status: 'PENDING' });

      expect(result).toEqual(mockOrdersWithDetails);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        skip: undefined,
        take: undefined,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const mockOrderWithDetails = {
        ...mockOrder,
        user: mockUser,
        orderItems: [mockOrderItem],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(
        mockOrderWithDetails,
      );

      const result = await service.findOne('1');

      expect(result).toEqual(mockOrderWithDetails);
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should return null when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new order with items', async () => {
      const createData = {
        items: [
          {
            productId: '1',
            quantity: 2,
          },
        ],
        shippingAddress: {
          fullName: 'Test User',
          phone: '1234567890',
          email: 'test@example.com',
          province: 'Test Province',
          district: 'Test District',
          ward: 'Test Ward',
          address: 'Test Address',
          apartment: 'Test Apartment',
          note: 'Test Note',
        },
        deliveryFee: 0,
        paymentMethod: 'COD',
      };

      const mockCreatedOrder = {
        ...mockOrder,
        user: mockUser,
        orderItems: [mockOrderItem],
      };

      mockPrismaService.order.create.mockResolvedValue(mockCreatedOrder);
      mockPrismaService.product.findUnique.mockResolvedValue({
        id: '1',
        price: new Prisma.Decimal('1000000'),
      });

      const result = await service.create(createData as any, '1');

      expect(result).toEqual(mockCreatedOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'SHIPPED',
        user: mockUser,
        orderItems: [mockOrderItem],
      };
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.updateStatus('1', 'SHIPPED');

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'SHIPPED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const mockStats = {
        totalOrders: 10,
        totalRevenue: new Prisma.Decimal('50000000'),
        ordersByStatus: [
          { status: 'PENDING', _count: { status: 3 } },
          { status: 'SHIPPED', _count: { status: 4 } },
          { status: 'DELIVERED', _count: { status: 2 } },
          { status: 'CANCELLED', _count: { status: 1 } },
        ],
      };

      mockPrismaService.order.count.mockResolvedValue(10);
      mockPrismaService.order.aggregate.mockResolvedValue({
        _sum: { total: new Prisma.Decimal('50000000') },
      });
      mockPrismaService.order.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: { status: 3 } },
        { status: 'SHIPPED', _count: { status: 4 } },
        { status: 'DELIVERED', _count: { status: 2 } },
        { status: 'CANCELLED', _count: { status: 1 } },
      ]);

      const result = await service.getOrderStats();

      expect(result).toEqual(mockStats);
      expect(mockPrismaService.order.count).toHaveBeenCalled();
      expect(mockPrismaService.order.aggregate).toHaveBeenCalled();
      expect(mockPrismaService.order.groupBy).toHaveBeenCalled();
    });
  });
});
