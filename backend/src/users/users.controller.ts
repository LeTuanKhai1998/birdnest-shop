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
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService, UserResponse } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Role } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(): Promise<UserResponse[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<UserResponse | null> {
    return this.usersService.findById(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string): Promise<UserResponse | null> {
    return this.usersService.findById(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateData: any): Promise<UserResponse> {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  @Patch('profile/nextauth')
  async updateNextAuthProfile(@Body() body: { userId: string; avatar?: string; name?: string; phone?: string; bio?: string }): Promise<UserResponse> {
    const { userId, ...updateData } = body;
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.usersService.updateProfile(userId, updateData);
  }

  @Patch('profile/password')
  async changePassword(
    @Request() req,
    @Body() body: { userId?: string; currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    // For NextAuth users, userId comes in the request body
    // For JWT users, userId comes from the token
    const userId = body.userId || req.user?.userId;
    
    if (!userId) {
      throw new ForbiddenException('User ID not provided');
    }
    
    return this.usersService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Patch(':id/admin-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateAdminStatus(
    @Param('id') id: string,
    @Body('isAdmin') isAdmin: boolean,
  ): Promise<UserResponse> {
    return this.usersService.updateAdminStatus(id, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    // Note: Remove method not implemented in service yet
    // For now, just return success message
    return { message: 'User deletion not implemented yet' };
  }
}
