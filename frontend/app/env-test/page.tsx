'use client';

export default function EnvTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}
        </div>
        <div>
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}
        </div>
      </div>
    </div>
  );
} 