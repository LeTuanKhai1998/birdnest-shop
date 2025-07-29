import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Order, Prisma, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    userId?: string;
    status?: OrderStatus;
  }): Promise<Order[]> {
    const { skip, take, userId, status } = params;

    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      skip,
      take,
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
  }

  async findOne(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
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
  }

  async create(data: any, userId: string): Promise<Order> {
    const { info, products, deliveryFee, paymentMethod } = data;
    
    // Compose shipping address string
    const shippingAddress = [
      info.fullName,
      info.phone,
      info.email,
      info.province,
      info.district,
      info.ward,
      info.address,
      info.apartment,
      info.note,
    ]
      .filter(Boolean)
      .join(', ');

    // Calculate total
    const subtotal = products.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0,
    );
    const total = subtotal + (deliveryFee || 0);

    return this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        paymentMethod: paymentMethod?.toUpperCase() || 'COD',
        shippingAddress,
        orderItems: {
          create: products.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
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
  }

  async createGuestOrder(data: any): Promise<Order> {
    const { info, products, deliveryFee, paymentMethod } = data;
    
    // Map payment method to correct enum value
    const mapPaymentMethod = (method: string): any => {
      switch (method.toLowerCase()) {
        case 'bank':
        case 'bank_transfer':
          return 'BANK_TRANSFER';
        case 'stripe':
          return 'STRIPE';
        case 'momo':
          return 'MOMO';
        case 'vnpay':
          return 'VNPAY';
        case 'cod':
        default:
          return 'COD';
      }
    };
    
    // For guest orders, we save the guest information directly to the order
    // No need to create a user account
    const order = await this.prisma.order.create({
      data: {
        // userId is undefined for guest orders
        userId: undefined,
        // Save guest information
        guestEmail: info.email,
        guestName: info.fullName,
        guestPhone: info.phone,
        total: new Prisma.Decimal(
          products.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0) + deliveryFee
        ),
        paymentMethod: mapPaymentMethod(paymentMethod),
        shippingAddress: `${info.fullName}, ${info.phone}, ${info.address}`,
        orderItems: {
          create: products.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: new Prisma.Decimal(item.product.price),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
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
  }

  async getOrderStats() {
    const totalOrders = await this.prisma.order.count();
    const totalRevenue = await this.prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: ['PAID', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus,
    };
  }

  async searchGuestOrders(query: string): Promise<any[]> {
    return this.prisma.order.findMany({
      where: {
        OR: [
          { guestEmail: { contains: query, mode: 'insensitive' } },
          { guestPhone: { contains: query, mode: 'insensitive' } },
        ],
        // Only return guest orders (where userId is undefined)
        userId: undefined,
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        shippingAddress: true,
        orderItems: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
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
  }
}
