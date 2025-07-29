import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { Product, Category, Image, Prisma } from '@prisma/client';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/products (GET)', () => {
    it('should return products endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle category filter', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ categoryId: 'test-category' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle search filter', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ search: 'test' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle pagination', () => {
      return request(app.getHttpServer())
        .get('/api/products')
        .query({ skip: 0, take: 5 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/products/categories (GET)', () => {
    it('should return categories endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/products/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/products/:id (GET)', () => {
    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/api/products/non-existent-id')
        .expect(404);
    });
  });

  describe('/api/products/slug/:slug (GET)', () => {
    it('should return 404 for non-existent slug', () => {
      return request(app.getHttpServer())
        .get('/api/products/slug/non-existent-slug')
        .expect(404);
    });
  });
});
