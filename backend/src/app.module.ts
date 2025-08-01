import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AddressesModule } from './addresses/addresses.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { HealthModule } from './health/health.module';
import { PrismaService } from './common/prisma.service';
import { SecurityMiddleware } from './common/security.middleware';
import { CacheService } from './common/cache.service';
import { PerformanceService } from './common/performance.service';
import { PerformanceInterceptor } from './common/performance.interceptor';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { AuthErrorFilter } from './common/auth-error.filter';
import { ThrottleAuthGuard } from './common/throttle-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: process.env.NODE_ENV === 'test' ? 10000 : 100, // Higher limit for tests
      },
      {
        ttl: 3600000, // 1 hour
        limit: process.env.NODE_ENV === 'test' ? 100000 : 1000, // Higher limit for tests
      },
      {
        ttl: 300000, // 5 minutes
        limit: process.env.NODE_ENV === 'test' ? 1000 : 5, // Higher limit for auth attempts in tests
        name: 'auth',
      },
    ]),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    SettingsModule,
    NotificationsModule,
    AddressesModule,
    WishlistModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    CacheService,
    PerformanceService,
    PerformanceInterceptor,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AuthErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottleAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
