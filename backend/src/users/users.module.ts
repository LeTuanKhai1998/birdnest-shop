import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../common/prisma.service';
import { PasswordService } from '../common/password.service';

@Module({
  providers: [UsersService, PrismaService, PasswordService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
