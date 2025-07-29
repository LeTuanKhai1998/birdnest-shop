/**
 * Frontend performance utilities
 */

// Debounce function for search inputs
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, unknown>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startTimer(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }
  
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Keep only last 100 metrics per name
    const metrics = this.metrics.get(name)!;
    if (metrics.length > 100) {
      metrics.shift();
    }
  }
  
  getMetrics(name: string): { avg: number; min: number; max: number; count: number } {
    const metrics = this.metrics.get(name) || [];
    
    if (metrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    const sum = metrics.reduce((a, b) => a + b, 0);
    const avg = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);
    
    return { avg, min, max, count: metrics.length };
  }
  
  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    
    return result;
  }
  
  clear(): void {
    this.metrics.clear();
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image sizes
  getImageSizes(containerWidth: number): string {
    const sizes = [
      { width: 640, size: '100vw' },
      { width: 768, size: '50vw' },
      { width: 1024, size: '33vw' },
      { width: 1280, size: '25vw' },
    ];
    
    const size = sizes.find(s => containerWidth <= s.width)?.size || '20vw';
    return `(max-width: ${containerWidth}px) 100vw, ${size}`;
  },
  
  // Generate srcSet for responsive images
  generateSrcSet(baseUrl: string, widths: number[]): string {
    return widths
      .map(width => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  },
  
  // Lazy load image with placeholder
  createLazyImage(src: string, alt: string, placeholder?: string): {
    src: string;
    alt: string;
    placeholder: string;
    loading: 'lazy';
  } {
    return {
      src,
      alt,
      placeholder: placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1lcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
      loading: 'lazy' as const,
    };
  },
};

// API call optimization
export const apiOptimization = {
  // Cache API responses
  cache: new Map<string, { data: unknown; timestamp: number; ttl: number }>(),
  
  // Get cached response
  getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  },
  
  // Set cache
  setCache<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },
  
  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  },
  
  // Optimized fetch with caching
  async fetchWithCache<T>(
    url: string,
    options: RequestInit = {},
    ttl: number = 300000
  ): Promise<T> {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    const cached = this.getCached<T>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    this.setCache(cacheKey, data, ttl);
    return data;
  },
};

// Bundle size optimization
export const bundleOptimization = {
  // Dynamic import with loading state
  async loadComponent<T>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): Promise<T> {
    try {
      const mod = await importFn();
      return mod.default;
    } catch (error) {
      console.error('Failed to load component:', error);
      if (fallback) {
        return fallback as T;
      }
      throw error;
    }
  },
  
  // Preload critical resources
  preloadResource(href: string, as: string = 'fetch'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },
  
  // Prefetch non-critical resources
  prefetchResource(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },
}; 