import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('demo')
  async getDemoData() {
    // Return demo data for dashboard when no authentication is available
    return [
      {
        id: 'demo-order-1',
        userId: 'demo-user-1',
        status: 'delivered',
        total: '1500000',
        items: [
          {
            id: 'demo-item-1',
            orderId: 'demo-order-1',
            productId: 'demo-product-1',
            quantity: 2,
            price: '750000',
          }
        ],
        shippingAddress: {
          id: 'demo-address-1',
          fullName: 'Demo Customer',
          phone: '+84 123 456 789',
          address: '123 Demo Street',
          city: 'Ho Chi Minh City',
          state: 'District 1',
          zipCode: '70000',
          country: 'Vietnam',
          isDefault: true,
          userId: 'demo-user-1',
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'demo-user-1',
          name: 'Demo Customer',
          email: 'demo@example.com',
          isAdmin: false,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      {
        id: 'demo-order-2',
        userId: 'demo-user-2',
        status: 'processing',
        total: '2500000',
        items: [
          {
            id: 'demo-item-2',
            orderId: 'demo-order-2',
            productId: 'demo-product-2',
            quantity: 1,
            price: '2500000',
          }
        ],
        shippingAddress: {
          id: 'demo-address-2',
          fullName: 'Another Customer',
          phone: '+84 987 654 321',
          address: '456 Sample Road',
          city: 'Hanoi',
          state: 'Ba Dinh',
          zipCode: '10000',
          country: 'Vietnam',
          isDefault: true,
          userId: 'demo-user-2',
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'demo-user-2',
          name: 'Another Customer',
          email: 'another@example.com',
          isAdmin: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      {
        id: 'demo-order-3',
        userId: 'demo-user-3',
        status: 'pending',
        total: '800000',
        items: [
          {
            id: 'demo-item-3',
            orderId: 'demo-order-3',
            productId: 'demo-product-3',
            quantity: 1,
            price: '800000',
          }
        ],
        shippingAddress: {
          id: 'demo-address-3',
          fullName: 'Third Customer',
          phone: '+84 555 123 456',
          address: '789 Test Avenue',
          city: 'Da Nang',
          state: 'Hai Chau',
          zipCode: '55000',
          country: 'Vietnam',
          isDefault: true,
          userId: 'demo-user-3',
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'demo-user-3',
          name: 'Third Customer',
          email: 'third@example.com',
          isAdmin: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    ];
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      userId,
      status: status as OrderStatus | undefined,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: CreateOrderDto) {
    return this.ordersService.create(data as any);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, data.status);
  }
}
