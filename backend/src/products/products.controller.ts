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
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateCategoryColorDto } from './dto/update-category-color.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: Record<string, string>) {
    const { skip, take, categoryId, search } = query;
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

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getStats() {
    return this.productsService.getStats();
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
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createProductDto: CreateProductDto) {
    // Convert DTO to Prisma input format
    const { categoryId, images, ...productData } = createProductDto;
    const prismaData = {
      ...productData,
      category: {
        connect: { id: categoryId },
      },
      ...(images && Array.isArray(images) && images.length > 0 && {
        images: {
          create: images.filter(img => 
            img && typeof img === 'object' && 
            typeof img.url === 'string' && 
            img.url.trim() !== '' &&
            typeof img.isPrimary === 'boolean'
          ),
        },
      }),
    };
    return this.productsService.create(prismaData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    // Convert DTO to Prisma input format
    const { categoryId, images, ...productData } = updateProductDto;
    const prismaData: Record<string, unknown> = { ...productData };

    if (categoryId) {
      prismaData.category = {
        connect: { id: categoryId },
      };
    }

    // Handle images update if provided
    if (images && Array.isArray(images)) {
      // Filter out invalid image objects
      const validImages = images.filter(img => 
        img && typeof img === 'object' && 
        typeof img.url === 'string' && 
        img.url.trim() !== '' &&
        typeof img.isPrimary === 'boolean'
      );

      if (validImages.length > 0) {
        prismaData.images = {
          deleteMany: {}, // Delete existing images
          create: validImages, // Create new images
        };
      } else {
        // If no valid images provided, just delete existing images
        prismaData.images = {
          deleteMany: {}, // Delete existing images
        };
      }
    }

    return this.productsService.update(id, prismaData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Patch('categories/:id/color')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateCategoryColor(
    @Param('id') id: string,
    @Body() updateCategoryColorDto: UpdateCategoryColorDto,
  ) {
    return this.productsService.updateCategoryColor(id, updateCategoryColorDto.colorScheme || null);
  }


}
