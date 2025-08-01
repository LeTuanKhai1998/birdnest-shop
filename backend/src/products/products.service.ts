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

    // Invalidate cache - clear all product-related cache entries
    this.cacheService.deletePattern('products:findAll');
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

    // Invalidate cache - clear all product-related cache entries
    this.cacheService.deletePattern('products:findAll');
    this.cacheService.delete(`products:findOne:${id}`);

    return product;
  }

  async delete(id: string): Promise<Product> {
    // First, fetch the product to return it later
    const productToDelete = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });

    if (!productToDelete) {
      throw new Error('Product not found');
    }

    // Delete related records to avoid foreign key constraints
    await this.prisma.$transaction(async (tx) => {
      // Delete order items that reference this product
      await tx.orderItem.deleteMany({
        where: { productId: id },
      });

      // Delete reviews that reference this product
      await tx.review.deleteMany({
        where: { productId: id },
      });

      // Delete product images
      await tx.image.deleteMany({
        where: { productId: id },
      });

      // Finally, delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    // Invalidate cache - clear all product-related cache entries
    this.cacheService.deletePattern('products:findAll');
    this.cacheService.delete(`products:findOne:${id}`);

    return productToDelete;
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

  async updateCategoryColor(categoryId: string, colorScheme: string | null) {
    const updatedCategory = await this.prisma.category.update({
      where: { id: categoryId },
      data: { colorScheme },
    });

    // Invalidate cache for categories
    this.cacheService.deletePattern('categories:*');
    this.cacheService.deletePattern('products:*');

    return updatedCategory;
  }

  async getStats() {
    // Try to get from cache first
    const cacheKey = 'products:stats';
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all products for statistics
    const products = await this.prisma.product.findMany({
      select: {
        quantity: true,
        price: true,
        isActive: true,
      },
    });

    // Calculate statistics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStock = products.filter(p => (p.quantity || 0) < 10 && p.isActive).length;
    const outOfStock = products.filter(p => (p.quantity || 0) === 0 && p.isActive).length;
    
    // Calculate total inventory value
    const totalValue = products.reduce((sum, product) => {
      const quantity = product.quantity || 0;
      const price = parseFloat(product.price.toString());
      return sum + (quantity * price);
    }, 0);

    // Calculate average price
    const averagePrice = totalProducts > 0 
      ? products.reduce((sum, product) => sum + parseFloat(product.price.toString()), 0) / totalProducts
      : 0;

    const stats = {
      totalProducts,
      activeProducts,
      lowStock,
      outOfStock,
      totalValue: totalValue.toString(),
      averagePrice: averagePrice.toString(),
      // Add trend data (placeholder for now)
      totalProductsTrend: 0,
      totalValueTrend: 0,
    };

    // Cache the result for 5 minutes
    this.cacheService.set(cacheKey, stats, 300000);

    return stats;
  }
}
