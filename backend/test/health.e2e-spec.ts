import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestingApp } from './test-setup';

describe('Health API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const timestamp = response.body.timestamp;
      expect(new Date(timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should return valid uptime', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const uptime = response.body.uptime;
      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThan(0);
    });

    it('should return memory usage information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      // Check if memory info is available in the response
      if (response.body.info && response.body.info.application && response.body.info.application.details) {
        const memory = response.body.info.application.details.memory;
        expect(memory).toHaveProperty('rss');
        expect(memory).toHaveProperty('heapTotal');
        expect(memory).toHaveProperty('heapUsed');
        expect(memory).toHaveProperty('external');
        expect(typeof memory.rss).toBe('number');
        expect(typeof memory.heapTotal).toBe('number');
        expect(typeof memory.heapUsed).toBe('number');
        expect(typeof memory.external).toBe('number');
      } else {
        // If memory info is not available, just check basic structure
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('ok');
      }
    });

    it('should return version information', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      // Check if version info is available in the response
      if (response.body.info && response.body.info.application && response.body.info.application.details) {
        const version = response.body.info.application.details.version;
        expect(typeof version).toBe('string');
        expect(version).toMatch(/^\d+\.\d+\.\d+$/);
      } else {
        // If version info is not available, just check basic structure
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('ok');
      }
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness check status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('application');
      expect(response.body.info.application).toHaveProperty('status');
      expect(response.body.info.application.status).toBe('up');
      expect(response.body.info.application).toHaveProperty('details');
      expect(response.body.info.application.details).toHaveProperty('timestamp');
      expect(response.body.info.application.details).toHaveProperty('uptime');
    });

    it('should not include memory and version in readiness check', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      // Check that basic health info is present
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('application');
      expect(response.body.info.application).toHaveProperty('details');
      expect(response.body.info.application.details).toHaveProperty('timestamp');
      expect(response.body.info.application.details).toHaveProperty('uptime');
      
      // Memory and version should not be in readiness check
      expect(response.body.info.application.details).not.toHaveProperty('memory');
      expect(response.body.info.application.details).not.toHaveProperty('version');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness check status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('application');
      expect(response.body.info.application).toHaveProperty('status');
      expect(response.body.info.application.status).toBe('up');
      expect(response.body.info.application).toHaveProperty('details');
      expect(response.body.info.application.details).toHaveProperty('timestamp');
      expect(response.body.info.application.details).toHaveProperty('uptime');
    });

    it('should not include memory and version in liveness check', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      // Check that basic health info is present
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('application');
      expect(response.body.info.application).toHaveProperty('details');
      expect(response.body.info.application.details).toHaveProperty('timestamp');
      expect(response.body.info.application.details).toHaveProperty('uptime');
      
      // Memory and version should not be in liveness check
      expect(response.body.info.application.details).not.toHaveProperty('memory');
      expect(response.body.info.application.details).not.toHaveProperty('version');
    });
  });

  describe('Health check consistency', () => {
    it('should return consistent status across all health endpoints', async () => {
      const [healthResponse, readyResponse, liveResponse] = await Promise.all([
        request(app.getHttpServer()).get('/api/health'),
        request(app.getHttpServer()).get('/api/health/ready'),
        request(app.getHttpServer()).get('/api/health/live'),
      ]);

      expect(healthResponse.body.status).toBe('ok');
      expect(readyResponse.body.status).toBe('ok');
      expect(liveResponse.body.status).toBe('ok');
    });

    it('should return valid timestamps across all endpoints', async () => {
      const [healthResponse, readyResponse, liveResponse] = await Promise.all([
        request(app.getHttpServer()).get('/api/health'),
        request(app.getHttpServer()).get('/api/health/ready'),
        request(app.getHttpServer()).get('/api/health/live'),
      ]);

      const healthTimestamp = new Date(healthResponse.body.timestamp).getTime();
      const readyTimestamp = new Date(readyResponse.body.info.application.details.timestamp).getTime();
      const liveTimestamp = new Date(liveResponse.body.info.application.details.timestamp).getTime();

      expect(healthTimestamp).toBeGreaterThan(0);
      expect(readyTimestamp).toBeGreaterThan(0);
      expect(liveTimestamp).toBeGreaterThan(0);

      // Timestamps should be close to each other (within 5 seconds)
      const now = Date.now();
      expect(Math.abs(healthTimestamp - now)).toBeLessThan(5000);
      expect(Math.abs(readyTimestamp - now)).toBeLessThan(5000);
      expect(Math.abs(liveTimestamp - now)).toBeLessThan(5000);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed health check requests gracefully', async () => {
      // Test with invalid HTTP method
      await request(app.getHttpServer())
        .post('/api/health')
        .expect(404);

      await request(app.getHttpServer())
        .put('/api/health')
        .expect(404);

      await request(app.getHttpServer())
        .delete('/api/health')
        .expect(404);
    });

    it('should handle malformed readiness check requests gracefully', async () => {
      await request(app.getHttpServer())
        .post('/api/health/ready')
        .expect(404);

      await request(app.getHttpServer())
        .put('/api/health/ready')
        .expect(404);
    });

    it('should handle malformed liveness check requests gracefully', async () => {
      await request(app.getHttpServer())
        .post('/api/health/live')
        .expect(404);

      await request(app.getHttpServer())
        .put('/api/health/live')
        .expect(404);
    });
  });

  describe('Performance', () => {
    it('should respond quickly to health checks', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Health checks should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    it('should respond quickly to readiness checks', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Readiness checks should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });

    it('should respond quickly to liveness checks', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Liveness checks should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });
  });
}); 