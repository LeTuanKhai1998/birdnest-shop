import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-setup';

describe('Basic App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return 200 for root endpoint', () => {
      return request(app.getHttpServer()).get('/api/').expect(200);
    });

    it('should return 404 for non-existent endpoint', () => {
      return request(app.getHttpServer()).get('/api/non-existent').expect(404);
    });
  });
});
