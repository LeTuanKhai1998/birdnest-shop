export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="bg-gray-200 h-8 rounded w-1/3 mb-4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
        </div>

        {/* Filters skeleton */}
        <div className="mb-8">
          <div className="bg-gray-200 h-12 rounded-lg mb-4"></div>
          <div className="flex gap-4">
            <div className="bg-gray-200 h-8 rounded w-24"></div>
            <div className="bg-gray-200 h-8 rounded w-24"></div>
            <div className="bg-gray-200 h-8 rounded w-24"></div>
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                <div className="bg-gray-200 h-6 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 