'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useManualLoading } from '@/hooks/useManualLoading';

export function LoadingDemo() {
  const [showOverlay, setShowOverlay] = useState(false);
  const { isLoading, withLoading } = useManualLoading();

  const handleManualLoading = async () => {
    await withLoading(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  };

  const handleOverlayLoading = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 2000);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Loading UI Demo</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">1. Manual Loading (with Progress Bar)</h3>
          <Button 
            onClick={handleManualLoading}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Loading...' : 'Start Manual Loading'}
          </Button>
        </div>

        <div>
          <h3 className="font-medium mb-2">2. Fullscreen Overlay</h3>
          <Button 
            onClick={handleOverlayLoading}
            variant="outline"
            className="w-full md:w-auto"
          >
            Show Loading Overlay
          </Button>
        </div>

        <div>
          <h3 className="font-medium mb-2">3. Navigation Loading</h3>
          <p className="text-sm text-gray-600 mb-2">
            Try navigating between pages to see the progress bar in action
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">Go to Products</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/about">Go to About</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/contact">Go to Contact</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={showOverlay} 
        message="Processing your request..." 
      />
    </div>
  );
} 