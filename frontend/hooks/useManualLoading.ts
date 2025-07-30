'use client';

import { useState, useCallback } from 'react';
import NProgress from 'nprogress';

export function useManualLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    NProgress.start();
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    NProgress.done();
  }, []);

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
} 