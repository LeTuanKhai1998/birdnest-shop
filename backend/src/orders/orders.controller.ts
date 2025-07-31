import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SearchGuestOrdersDto } from './dto/search-guest-orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Post('guest')
  async createGuestOrder(@Body() data: any) {
    return this.ordersService.createGuestOrder(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query() query: any) {
    const { skip, take, userId, status } = query;
    return this.ordersService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      userId,
      status,
    });
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@Request() req, @Query() query: any) {
    const { skip, take, status } = query;
    return this.ordersService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      userId: req.user.userId,
      status,
    });
  }

  // NextAuth endpoints (no JWT required)
  @Get('nextauth/my-orders/:userId')
  async findMyOrdersForNextAuth(@Param('userId') userId: string, @Query() query: any) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    const { skip, take, status } = query;
    return this.ordersService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      userId,
      status,
    });
  }

  @Get('nextauth/:orderId/:userId')
  async findOneForNextAuth(@Param('orderId') orderId: string, @Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    const order = await this.ordersService.findOne(orderId);
    
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    // Check if user can access this order
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    
    return order;
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findOne(id);
    
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    // If order has a userId, require authentication
    if (order.userId) {
      if (!req.user) {
        throw new ForbiddenException('Authentication required to view this order');
      }
      
      // Check if user can access this order
      if (order.userId !== req.user.userId && !req.user.isAdmin) {
        throw new ForbiddenException('You can only view your own orders');
      }
    }
    
    // For guest orders (no userId), allow access without authentication
    return order;
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }

  @Post('guest/search')
  async searchGuestOrders(@Body() searchDto: SearchGuestOrdersDto) {
    return this.ordersService.searchGuestOrders(searchDto.query);
  }
}
