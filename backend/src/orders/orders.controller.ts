import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SearchGuestOrdersDto } from './dto/search-guest-orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @Post('guest')
  async createGuestOrder(@Body() createOrderDto: CreateOrderDto & { userId?: string }) {
    return this.ordersService.createGuestOrder(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
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
    const { status } = query;
    return this.ordersService.findAll({
      userId: req.user.userId,
      status,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    // Check if user is admin or owns the order
    const order = await this.ordersService.findOne(id);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Admin can view any order, users can only view their own
    if (req.user.isAdmin || order.userId === req.user.userId) {
      return order;
    }

    throw new BadRequestException('Access denied');
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
