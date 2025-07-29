import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('profile')
  async getProfile(@Request() req: Request) {
    // Assuming JWT payload has userId
    const userId = (req as any).user?.userId;
    if (!userId) {
      return { error: 'User not authenticated' };
    }
    return this.usersService.findById(userId);
  }

  @Put(':id/admin')
  async updateAdminStatus(
    @Param('id') id: string,
    @Body('isAdmin') isAdmin: boolean,
  ) {
    return this.usersService.updateAdminStatus(id, isAdmin);
  }
}
