import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PerformanceService } from './common/performance.service';
import { CacheService } from './common/cache.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PerformanceService,
          useValue: {
            getStats: jest.fn().mockReturnValue({
              totalRequests: 0,
              averageResponseTime: 0,
              slowestEndpoint: '',
              fastestEndpoint: '',
              errorRate: 0,
            }),
            getSlowestEndpoints: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: CacheService,
          useValue: {
            getStats: jest.fn().mockReturnValue({
              size: 0,
              keys: [],
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
