import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductReviews(@Param('productId') productId: string) {
    try {
      const reviews = await this.reviewsService.findByProductId(productId);
      return {
        success: true,
        data: reviews,
        message: 'Reviews retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve reviews',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'User has already reviewed this product' })
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    try {
      // Try both id and userId since JWT strategy might return either
      const userId = req.user.id || req.user.userId;
      
      if (!userId) {
        throw new HttpException('User ID not found in request', HttpStatus.UNAUTHORIZED);
      }
      
      const review = await this.reviewsService.create({
        ...createReviewDto,
        userId,
      });
      return {
        success: true,
        data: review,
        message: 'Review created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException as-is (409 status)
      }
      throw new HttpException(
        error.message || 'Failed to create review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews by user' })
  @ApiResponse({ status: 200, description: 'User reviews retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserReviews(@Param('userId') userId: string, @Request() req) {
    // Ensure user can only access their own reviews
    if (req.user.id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const reviews = await this.reviewsService.findByUserId(userId);
      return {
        success: true,
        data: reviews,
        message: 'User reviews retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve user reviews',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('debug/user/:userId/product/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Debug: Check if user has reviewed specific product' })
  @ApiResponse({ status: 200, description: 'Debug info retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async debugUserProductReview(@Param('userId') userId: string, @Param('productId') productId: string, @Request() req) {
    // Ensure user can only access their own debug info
    if (req.user.id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const existingReview = await this.reviewsService.findExistingReview(userId, productId);
      const allUserReviews = await this.reviewsService.findByUserId(userId);
      const allProductReviews = await this.reviewsService.findByProductId(productId);
      
      return {
        success: true,
        data: {
          existingReview,
          allUserReviews: allUserReviews.map(r => ({ id: r.id, productId: r.productId, rating: r.rating, createdAt: r.createdAt })),
          allProductReviews: allProductReviews.map(r => ({ id: r.id, userId: r.userId, rating: r.rating, createdAt: r.createdAt })),
          userHasReviewed: !!existingReview
        },
        message: 'Debug info retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve debug info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


} 