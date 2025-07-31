import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // JWT protected endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
    // Only admins can create notifications
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can create notifications');
    }
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.notificationsService.findAll(req.user.userId, req.user.isAdmin);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUnreadCount(@Request() req) {
    return this.notificationsService.findUnreadCount(
      req.user.userId,
      req.user.isAdmin,
    );
  }

  // NextAuth endpoints (no JWT required)
  @Get('nextauth/:userId')
  async findAllForNextAuth(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.notificationsService.findAll(userId, false);
  }

  @Get('nextauth/unread-count/:userId')
  async getUnreadCountForNextAuth(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.notificationsService.findUnreadCount(userId, false);
  }

  // JWT protected endpoints (continued)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req) {
    const notification = await this.notificationsService.findOne(id, req.user.userId, req.user.isAdmin);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    const notification = await this.notificationsService.markAsRead(
      id,
      req.user.userId,
      req.user.isAdmin,
    );
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
      req.user.isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Request() req) {
    const notification = await this.notificationsService.remove(id, req.user.userId, req.user.isAdmin);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  // NextAuth endpoints (continued)
  @Patch('nextauth/:id/read/:userId')
  async markAsReadForNextAuth(@Param('id') id: string, @Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    const notification = await this.notificationsService.markAsRead(id, userId, false);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  @Patch('nextauth/read-all/:userId')
  async markAllAsReadForNextAuth(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.notificationsService.markAllAsRead(userId, false);
  }

  @Delete('nextauth/:id/:userId')
  async removeForNextAuth(@Param('id') id: string, @Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    const notification = await this.notificationsService.remove(id, userId, false);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }
}
