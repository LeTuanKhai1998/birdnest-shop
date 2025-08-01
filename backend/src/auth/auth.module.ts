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
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('NEXTAUTH_SECRET') || 
                configService.get<string>('JWT_SECRET') || 
                'fallback-secret-key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d' 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    AdminGuard,
    RolesGuard,
    PrismaService,
    PasswordService,
  ],
  exports: [JwtAuthGuard, AdminGuard, RolesGuard],
})
export class AuthModule {}
