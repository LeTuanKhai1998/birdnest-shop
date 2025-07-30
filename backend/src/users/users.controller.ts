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
