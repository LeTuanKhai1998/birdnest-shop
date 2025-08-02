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
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    try {
      const userId = req.user.id;
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
} 