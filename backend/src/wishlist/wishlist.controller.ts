import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.wishlistService.findAll(req.user.userId);
  }

  @Post()
  async create(@Body() data: { productId: string }, @Request() req: any) {
    return this.wishlistService.create(req.user.userId, data.productId);
  }

  @Delete()
  async remove(@Body() data: { productId: string }, @Request() req: any) {
    return this.wishlistService.remove(req.user.userId, data.productId);
  }
} 