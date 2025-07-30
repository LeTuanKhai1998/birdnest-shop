import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import { GlobalExceptionFilter } from '../src/common/global-exception.filter';
import { PerformanceInterceptor } from '../src/common/performance.interceptor';
import { PerformanceService } from '../src/common/performance.service';

export async function createTestingApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Security middleware
  app.use(helmet({
    xFrameOptions: { action: 'deny' },
  }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global performance interceptor
  app.useGlobalInterceptors(
    new PerformanceInterceptor(app.get(PerformanceService)),
  );

  // Enable CORS with strict configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe with security enhancements
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  await app.init();
  return app;
} 