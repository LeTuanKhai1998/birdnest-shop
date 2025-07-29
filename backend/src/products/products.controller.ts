import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('demo')
  async getDemoData() {
    // Return demo data for dashboard when no products are available
    return [
      {
        id: 'demo-product-1',
        name: 'Premium Bird\'s Nest',
        slug: 'premium-birds-nest',
        description: 'High-quality refined bird\'s nest from Kien Giang',
        price: '1500000',
        discount: 0,
        quantity: 25,
        categoryId: 'demo-category-1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: 'demo-category-1',
          name: 'Refined Nest',
          slug: 'refined-nest',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [
          {
            id: 'demo-image-1',
            url: '/images/p1.png',
            isPrimary: true,
            productId: 'demo-product-1',
            createdAt: new Date().toISOString(),
          }
        ],
        _count: {
          reviews: 12
        }
      },
      {
        id: 'demo-product-2',
        name: 'Raw Bird\'s Nest',
        slug: 'raw-birds-nest',
        description: 'Natural raw bird\'s nest with authentic taste',
        price: '2500000',
        discount: 10,
        quantity: 8,
        categoryId: 'demo-category-2',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: 'demo-category-2',
          name: 'Raw Nest',
          slug: 'raw-nest',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [
          {
            id: 'demo-image-2',
            url: '/images/p2.png',
            isPrimary: true,
            productId: 'demo-product-2',
            createdAt: new Date().toISOString(),
          }
        ],
        _count: {
          reviews: 8
        }
      },
      {
        id: 'demo-product-3',
        name: 'Feather-removed Bird\'s Nest',
        slug: 'feather-removed-birds-nest',
        description: 'Carefully cleaned bird\'s nest with feathers removed',
        price: '800000',
        discount: 5,
        quantity: 3,
        categoryId: 'demo-category-3',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: 'demo-category-3',
          name: 'Feather-removed Nest',
          slug: 'feather-removed-nest',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [
          {
            id: 'demo-image-3',
            url: '/images/p3.png',
            isPrimary: true,
            productId: 'demo-product-3',
            createdAt: new Date().toISOString(),
          }
        ],
        _count: {
          reviews: 5
        }
      },
      {
        id: 'demo-product-4',
        name: 'Premium Gift Combo',
        slug: 'premium-gift-combo',
        description: 'Luxury gift combo with multiple bird\'s nest products',
        price: '3500000',
        discount: 15,
        quantity: 15,
        categoryId: 'demo-category-1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: 'demo-category-1',
          name: 'Refined Nest',
          slug: 'refined-nest',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [
          {
            id: 'demo-image-4',
            url: '/images/p1.png',
            isPrimary: true,
            productId: 'demo-product-4',
            createdAt: new Date().toISOString(),
          }
        ],
        _count: {
          reviews: 3
        }
      },
      {
        id: 'demo-product-5',
        name: 'Organic Bird\'s Nest',
        slug: 'organic-birds-nest',
        description: 'Certified organic bird\'s nest from natural sources',
        price: '1800000',
        discount: 0,
        quantity: 2,
        categoryId: 'demo-category-2',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: 'demo-category-2',
          name: 'Raw Nest',
          slug: 'raw-nest',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        images: [
          {
            id: 'demo-image-5',
            url: '/images/p2.png',
            isPrimary: true,
            productId: 'demo-product-5',
            createdAt: new Date().toISOString(),
          }
        ],
        _count: {
          reviews: 1
        }
      }
    ];
  }

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      categoryId,
      search,
    });
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: CreateProductDto) {
    return this.productsService.create(data as any);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
