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
  BadRequestException,
} from '@nestjs/common';
import { UsersService, UserResponse } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string): Promise<UserResponse | null> {
    return this.usersService.findById(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateData: any,
  ): Promise<UserResponse> {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  @Patch('profile/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Patch(':id/admin-status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateAdminStatus(
    @Param('id') id: string,
    @Body() body: { isAdmin: boolean },
  ): Promise<UserResponse> {
    return this.usersService.updateAdminStatus(id, body.isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    // Note: Remove method not implemented in service yet
    // For now, just return success message
    return { message: 'User deletion not implemented yet' };
  }
}
