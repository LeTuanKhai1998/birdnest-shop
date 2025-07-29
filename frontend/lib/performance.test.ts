import {
  debounce,
  throttle,
  memoize,
  PerformanceMonitor,
  imageOptimization,
  apiOptimization,
} from './performance';

describe('Performance Utils', () => {
  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only execute once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should pass arguments correctly', (done) => {
      let receivedArgs: unknown[] = [];
      const debouncedFn = debounce((...args: unknown[]) => {
        receivedArgs = args;
      }, 100);

      debouncedFn('test', 123);

      setTimeout(() => {
        expect(receivedArgs).toEqual(['test', 123]);
        done();
      }, 150);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should only execute once immediately
      expect(callCount).toBe(1);

      // After throttle period, should allow another call
      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 150);
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      let callCount = 0;
      const expensiveFn = memoize((...args: unknown[]) => {
        callCount++;
        return (args[0] as number) + (args[1] as number);
      });

      // First call
      expect(expensiveFn(1, 2)).toBe(3);
      expect(callCount).toBe(1);

      // Second call with same args
      expect(expensiveFn(1, 2)).toBe(3);
      expect(callCount).toBe(1); // Should not increment

      // Different args
      expect(expensiveFn(2, 3)).toBe(5);
      expect(callCount).toBe(2);
    });

    it('should work with custom key generator', () => {
      let callCount = 0;
      const expensiveFn = memoize(
        (...args: unknown[]) => {
          callCount++;
          const obj = args[0] as { a: number; b: number };
          return obj.a + obj.b;
        },
        (...args: unknown[]) => {
          const obj = args[0] as { a: number; b: number };
          return `${obj.a}-${obj.b}`;
        }
      );

      expect(expensiveFn({ a: 1, b: 2 })).toBe(3);
      expect(expensiveFn({ a: 1, b: 2 })).toBe(3);
      expect(callCount).toBe(1);
    });
  });

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = PerformanceMonitor.getInstance();
      monitor.clear();
    });

    it('should record and retrieve metrics', () => {
      monitor.recordMetric('test', 100);
      monitor.recordMetric('test', 200);
      monitor.recordMetric('test', 300);

      const metrics = monitor.getMetrics('test');
      expect(metrics.count).toBe(3);
      expect(metrics.avg).toBe(200);
      expect(metrics.min).toBe(100);
      expect(metrics.max).toBe(300);
    });

    it('should provide timer functionality', () => {
      const stopTimer = monitor.startTimer('timer-test');
      
      // Simulate some work
      setTimeout(() => {
        stopTimer();
        
        const metrics = monitor.getMetrics('timer-test');
        expect(metrics.count).toBe(1);
        expect(metrics.avg).toBeGreaterThan(0);
      }, 10);
    });

    it('should limit metrics per name', () => {
      // Add more than 100 metrics
      for (let i = 0; i < 110; i++) {
        monitor.recordMetric('test', i);
      }

      const metrics = monitor.getMetrics('test');
      expect(metrics.count).toBe(100); // Should be limited to 100
    });
  });

  describe('imageOptimization', () => {
    it('should generate correct image sizes', () => {
      expect(imageOptimization.getImageSizes(500)).toBe('(max-width: 500px) 100vw, 100vw');
      expect(imageOptimization.getImageSizes(800)).toBe('(max-width: 800px) 100vw, 33vw');
      expect(imageOptimization.getImageSizes(1200)).toBe('(max-width: 1200px) 100vw, 25vw');
    });

    it('should generate srcSet correctly', () => {
      const srcSet = imageOptimization.generateSrcSet('https://example.com/image.jpg', [300, 600, 900]);
      expect(srcSet).toBe(
        'https://example.com/image.jpg?w=300 300w, https://example.com/image.jpg?w=600 600w, https://example.com/image.jpg?w=900 900w'
      );
    });

    it('should create lazy image config', () => {
      const lazyImage = imageOptimization.createLazyImage('test.jpg', 'Test Image');
      
      expect(lazyImage.src).toBe('test.jpg');
      expect(lazyImage.alt).toBe('Test Image');
      expect(lazyImage.loading).toBe('lazy');
      expect(lazyImage.placeholder).toBeDefined();
    });
  });

  describe('apiOptimization', () => {
    beforeEach(() => {
      apiOptimization.clearCache();
    });

    it('should cache and retrieve data', () => {
      const testData = { test: 'data' };
      
      apiOptimization.setCache('test-key', testData, 1000);
      const cached = apiOptimization.getCached('test-key');
      
      expect(cached).toEqual(testData);
    });

    it('should expire cached data', () => {
      const testData = { test: 'data' };
      
      apiOptimization.setCache('test-key', testData, 1); // 1ms TTL
      
      // Wait for expiration
      setTimeout(() => {
        const cached = apiOptimization.getCached('test-key');
        expect(cached).toBeNull();
      }, 10);
    });

    it('should clear cache by pattern', () => {
      apiOptimization.setCache('user:1', { id: 1 });
      apiOptimization.setCache('user:2', { id: 2 });
      apiOptimization.setCache('product:1', { id: 1 });
      
      apiOptimization.clearCache('user');
      
      expect(apiOptimization.getCached('user:1')).toBeNull();
      expect(apiOptimization.getCached('user:2')).toBeNull();
      expect(apiOptimization.getCached('product:1')).not.toBeNull();
    });
  });
}); 