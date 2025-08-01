import React, { useMemo, useCallback, memo } from 'react';
import { Product } from '@/lib/types';

// Optimized Product List with memoization
export const OptimizedProductList = memo(({ 
  products, 
  loading, 
  onProductClick 
}: { 
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
}) => {
  // Memoize the sorted/filtered products
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
  }, [products]);

  // Memoize the click handler
  const handleProductClick = useCallback((product: Product) => {
    onProductClick(product);
  }, [onProductClick]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedProducts.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleProductClick(product)}
        >
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
          <p className="font-bold text-red-600">${product.price}</p>
        </div>
      ))}
    </div>
  );
});

OptimizedProductList.displayName = 'OptimizedProductList';

// Optimized Search Input with debouncing
export const OptimizedSearchInput = memo(({ 
  onSearch, 
  placeholder = "Search..." 
}: { 
  onSearch: (query: string) => void;
  placeholder?: string;
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
    />
  );
});

OptimizedSearchInput.displayName = 'OptimizedSearchInput';

// Optimized Pagination Component
export const OptimizedPagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  // Memoize page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Memoize click handlers
  const handlePageClick = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handlePrevClick = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextClick = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`px-3 py-2 border rounded-lg ${
            currentPage === page
              ? 'bg-red-500 text-white border-red-500'
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
});

OptimizedPagination.displayName = 'OptimizedPagination';

// Optimized Loading Spinner
export const OptimizedLoadingSpinner = memo(({ 
  size = 'md', 
  color = 'red' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'blue' | 'green';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    red: 'text-red-500',
    blue: 'text-blue-500',
    green: 'text-green-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-gray-300 border-t-current`}
      />
    </div>
  );
});

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner'; 