import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Basic App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return 200 for root endpoint', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200);
    });

    it('should return 404 for non-existent endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/non-existent')
        .expect(404);
    });
  });
}); 