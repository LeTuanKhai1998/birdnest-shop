import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CacheService } from '../common/cache.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    categoryId?: string;
    search?: string;
  }): Promise<Product[]> {
    const { skip, take, categoryId, search } = params;

    // Generate cache key
    const cacheKey = this.cacheService.generateKey('products:findAll', {
      skip: skip || 0,
      take: take || 10,
      categoryId: categoryId || '',
      search: search || '',
    });

    // Try to get from cache first
    const cached = this.cacheService.get<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        category: true,
        images: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Cache the result for 5 minutes
    this.cacheService.set(cacheKey, products, 300000);

    return products;
  }

  async findOne(id: string): Promise<Product | null> {
    // Try to get from cache first
    const cacheKey = `products:findOne:${id}`;
    const cached = this.cacheService.get<Product>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Cache the result for 10 minutes
    if (product) {
      this.cacheService.set(cacheKey, product, 600000);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    const product = await this.prisma.product.create({
      data,
      include: {
        category: true,
        images: true,
      },
    });

    // Invalidate cache
    this.cacheService.delete('products:findAll');
    this.cacheService.delete(`products:findOne:${product.id}`);

    return product;
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: true,
      },
    });

    // Invalidate cache
    this.cacheService.delete('products:findAll');
    this.cacheService.delete(`products:findOne:${id}`);

    return product;
  }

  async delete(id: string): Promise<Product> {
    const product = await this.prisma.product.delete({
      where: { id },
    });

    // Invalidate cache
    this.cacheService.delete('products:findAll');
    this.cacheService.delete(`products:findOne:${id}`);

    return product;
  }

  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }
}
