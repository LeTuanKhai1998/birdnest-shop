import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PasswordService } from '../common/password.service';

export type UserResponse = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async findAll(): Promise<UserResponse[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(createUserDto: any): Promise<UserResponse> {
    const { email, password, name, isAdmin = false } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isAdmin,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findById(id: string): Promise<UserResponse | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        bio: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateAdminStatus(id: string, isAdmin: boolean): Promise<UserResponse> {
    return this.prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(id: string, updateData: any): Promise<UserResponse> {
    // Only allow updating safe fields
    const allowedFields = ['name', 'phone', 'bio', 'avatar'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: filteredData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        bio: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: any): Promise<UserResponse> {
    // Only allow updating safe fields
    const allowedFields = ['name', 'email', 'isAdmin'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateUserDto[field] !== undefined) {
        filteredData[field] = updateUserDto[field];
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: filteredData,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.passwordService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const adminUsers = await this.prisma.user.count({
      where: { isAdmin: true },
    });
    const regularUsers = totalUsers - adminUsers;

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLastMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      newUsersLastMonth,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
