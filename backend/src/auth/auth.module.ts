import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { PrismaService } from '../common/prisma.service';
import { PasswordService } from '../common/password.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: `${configService.get<number>('JWT_ACCESS_EXP_MINUTES') || 30}m`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, AdminGuard, PrismaService, PasswordService],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, AdminGuard],
})
export class AuthModule {}
