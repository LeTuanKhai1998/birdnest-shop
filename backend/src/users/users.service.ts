import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export type UserResponse = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  bio?: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async findById(id: string): Promise<UserResponse | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        bio: true,
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
    const allowedFields = ['name', 'phone', 'bio'];
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
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
