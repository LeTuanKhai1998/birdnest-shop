'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';

export default function TestApiPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API call...');
        const response = await apiService.getCategories();
        console.log('API response:', response);
        setCategories(response);
      } catch (err) {
        console.error('API error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {categories.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Categories:</h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="bg-gray-100 p-3 rounded">
                <strong>{category.name}</strong> ({category.slug})
                {category._count && (
                  <span className="text-sm text-gray-600 ml-2">
                    - {category._count.products} products
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 