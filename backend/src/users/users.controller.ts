import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('demo')
  async getDemoData() {
    // Return demo data for dashboard when no authentication is available
    return [
      {
        id: 'demo-user-1',
        name: 'Demo Customer',
        email: 'demo@example.com',
        isAdmin: false,
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-user-2',
        name: 'Another Customer',
        email: 'another@example.com',
        isAdmin: false,
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-user-3',
        name: 'Third Customer',
        email: 'third@example.com',
        isAdmin: false,
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        isAdmin: true,
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      }
    ];
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: Request) {
    // JWT payload is available in req.user after JwtAuthGuard validation
    const user = (req as any).user;
    if (!user || !user.userId) {
      return { error: 'User not authenticated' };
    }
    
    try {
      return await this.usersService.findById(user.userId);
    } catch (error) {
      return { error: 'User not found' };
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: Request, @Body() updateData: any) {
    // JWT payload is available in req.user after JwtAuthGuard validation
    const user = (req as any).user;
    if (!user || !user.userId) {
      return { error: 'User not authenticated' };
    }
    
    try {
      return await this.usersService.updateProfile(user.userId, updateData);
    } catch (error) {
      return { error: 'Failed to update profile' };
    }
  }

  @Put(':id/admin')
  @UseGuards(JwtAuthGuard)
  async updateAdminStatus(
    @Param('id') id: string,
    @Body('isAdmin') isAdmin: boolean,
  ) {
    return this.usersService.updateAdminStatus(id, isAdmin);
  }
}
