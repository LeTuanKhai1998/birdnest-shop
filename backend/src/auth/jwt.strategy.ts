import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('NEXTAUTH_SECRET') || 
                   configService.get<string>('JWT_SECRET') || 
                   'fallback-secret-key',
    });
  }

  async validate(payload: any) {
    // Handle traditional JWT payload (backend format)
    if (payload.sub) {
      // Verify user exists in database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          isAdmin: true,
        },
      });

      if (user) {
        return {
          userId: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          role: user.isAdmin ? 'ADMIN' : 'USER',
        };
      }
    }

    // Handle NextAuth JWT payload (if any)
    if (payload.id) {
      // This is a NextAuth token, extract user info from payload
      return {
        userId: payload.id,
        email: payload.email,
        isAdmin: payload.isAdmin || false,
        role: payload.role || (payload.isAdmin ? 'ADMIN' : 'USER'),
      };
    }

    return null;
  }
}
