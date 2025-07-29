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
    return this.ordersService.create(data);
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
