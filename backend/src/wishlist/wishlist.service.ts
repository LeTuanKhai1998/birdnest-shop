import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async create(userId: string, productId: string) {
    return this.prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: { product: true },
    });
  }

  async remove(userId: string, productId: string) {
    return this.prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }
}
