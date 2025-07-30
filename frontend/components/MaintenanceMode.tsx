'use client';

import { useMaintenanceMode } from '@/lib/settings-context';
import { Wrench, AlertTriangle, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function MaintenanceMode() {
  const isMaintenanceMode = useMaintenanceMode();

  if (!isMaintenanceMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Under Maintenance
          </CardTitle>
          <CardDescription className="text-gray-600">
            We&apos;re currently performing some maintenance on our site. We&apos;ll be back shortly!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">
                  What&apos;s happening?
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;re updating our systems to provide you with a better shopping experience.
                  This should only take a few minutes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              <Home className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.href = 'mailto:support@birdnest.com'}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>Thank you for your patience!</p>
            <p className="mt-1">Expected completion: Soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 