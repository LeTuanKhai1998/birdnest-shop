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
    const { items, shippingAddress: addressInfo, deliveryFee, paymentMethod } = data;

    // Handle both info and shippingAddress formats
    const orderInfo = addressInfo;
    
    if (!orderInfo) {
      throw new Error('Order information is required');
    }

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

    // Compose shipping address string
    const shippingAddress = [
      orderInfo.fullName,
      orderInfo.phone,
      orderInfo.address,
      orderInfo.city,
      orderInfo.state,
      orderInfo.zipCode,
      orderInfo.country,
      orderInfo.apartment,
      orderInfo.note,
    ]
      .filter(Boolean)
      .join(', ');

    // Calculate total
    if (!items || !Array.isArray(items)) {
      throw new Error('Items array is required');
    }
    
    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      items.map(async (item: any) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, price: true },
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        return { ...item, product };
      })
    );
    
    const subtotal = itemsWithProducts.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
      0,
    );
    const total = subtotal + (deliveryFee || 0);

    return this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        paymentMethod: mapPaymentMethod(paymentMethod),
        shippingAddress,
        orderItems: {
          create: itemsWithProducts.map((item: any) => ({
            productId: item.productId,
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
    const { items, shippingAddress, deliveryFee, paymentMethod, userId } = data;

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

    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      items.map(async (item: any) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, price: true },
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        return { ...item, product };
      })
    );

    // Calculate total
    const subtotal = itemsWithProducts.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
      0,
    );
    const total = subtotal + (deliveryFee || 0);

    // Compose shipping address string
    const addressString = [
      shippingAddress.fullName,
      shippingAddress.phone,
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zipCode,
      shippingAddress.country,
      shippingAddress.apartment,
      shippingAddress.note,
    ]
      .filter(Boolean)
      .join(', ');

    // For guest orders, we save the guest information directly to the order
    // If userId is provided, link the order to the user
    const order = await this.prisma.order.create({
      data: {
        // Use userId if provided, otherwise undefined for true guest orders
        userId: userId || undefined,
        // Save guest information
        guestEmail: shippingAddress.email || '',
        guestName: shippingAddress.fullName,
        guestPhone: shippingAddress.phone,
        total: new Prisma.Decimal(total),
        paymentMethod: mapPaymentMethod(paymentMethod),
        shippingAddress: addressString,
        orderItems: {
          create: itemsWithProducts.map((item: any) => ({
            productId: item.productId,
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
