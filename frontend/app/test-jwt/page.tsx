'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { testAuthenticatedAPI, testGetAddresses, testCreateOrder } from '@/lib/test-auth-api';

export default function TestJWTPage() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Record<string, unknown>>({});

  const handleTestAPI = async () => {
    try {
      const result = await testAuthenticatedAPI();
      setResults((prev: Record<string, unknown>) => ({ ...prev, profile: result }));
    } catch (error) {
      setResults((prev: Record<string, unknown>) => ({ ...prev, profile: { error: error instanceof Error ? error.message : 'Unknown error' } }));
    }
  };

  const handleTestAddresses = async () => {
    try {
      const result = await testGetAddresses();
      setResults((prev: Record<string, unknown>) => ({ ...prev, addresses: result }));
    } catch (error) {
      setResults((prev: Record<string, unknown>) => ({ ...prev, addresses: { error: error instanceof Error ? error.message : 'Unknown error' } }));
    }
  };

  const handleTestOrder = async () => {
    try {
      const result = await testCreateOrder();
      setResults((prev: Record<string, unknown>) => ({ ...prev, order: result }));
    } catch (error) {
      setResults((prev: Record<string, unknown>) => ({ ...prev, order: { error: error instanceof Error ? error.message : 'Unknown error' } }));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">JWT Authentication Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Session Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>User:</strong> {session?.user?.email || 'Not logged in'}</p>
          <p><strong>Access Token:</strong> {session?.accessToken ? 'Present' : 'Not present'}</p>
          {session?.accessToken && (
            <details className="mt-2">
              <summary className="cursor-pointer">View Token (first 50 chars)</summary>
              <code className="text-xs break-all">{session.accessToken.substring(0, 50)}...</code>
            </details>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test API Calls</h2>
        <div className="space-y-4">
          <button
            onClick={handleTestAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Profile API
          </button>
          <button
            onClick={handleTestAddresses}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
          >
            Test Addresses API
          </button>
          <button
            onClick={handleTestOrder}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-2"
          >
            Test Create Order API
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 