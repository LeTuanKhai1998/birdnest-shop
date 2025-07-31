import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // JWT protected endpoints
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.wishlistService.findAll(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: { productId: string }, @Request() req: any) {
    return this.wishlistService.create(req.user.userId, data.productId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@Body() data: { productId: string }, @Request() req: any) {
    return this.wishlistService.remove(req.user.userId, data.productId);
  }

  // NextAuth endpoints (no JWT required)
  @Get('nextauth/:userId')
  async findAllForNextAuth(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.wishlistService.findAll(userId);
  }

  @Post('nextauth')
  async createForNextAuth(@Body() data: { userId: string; productId: string }) {
    const { userId, productId } = data;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.wishlistService.create(userId, productId);
  }

  @Delete('nextauth')
  async removeForNextAuth(@Body() data: { userId: string; productId: string }) {
    const { userId, productId } = data;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.wishlistService.remove(userId, productId);
  }
} 