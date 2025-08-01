import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.wishlistService.findAll(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() body: { productId: string }) {
    return this.wishlistService.create(req.user.userId, body.productId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Body() body: { productId: string }) {
    return this.wishlistService.remove(req.user.userId, body.productId);
  }
} 