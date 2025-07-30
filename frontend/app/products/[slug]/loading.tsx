export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl">
      <div className="animate-pulse">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-gray-200 h-4 w-16 rounded"></div>
          <div className="bg-gray-200 h-4 w-4 rounded"></div>
          <div className="bg-gray-200 h-4 w-20 rounded"></div>
        </div>
        
        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery skeleton */}
          <div className="space-y-4">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-20 w-20 rounded-lg"></div>
              ))}
            </div>
          </div>
          
          {/* Product info skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="bg-gray-200 h-8 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-gray-200 h-8 rounded w-1/3"></div>
              <div className="bg-gray-200 h-4 rounded w-1/4"></div>
            </div>
            
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <div className="bg-gray-200 h-4 rounded w-16"></div>
                <div className="bg-gray-200 h-4 rounded w-24"></div>
              </div>
              <div className="flex justify-between">
                <div className="bg-gray-200 h-4 rounded w-20"></div>
                <div className="bg-gray-200 h-4 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="bg-gray-200 h-4 rounded w-16"></div>
                <div className="bg-gray-200 h-4 rounded w-24"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 rounded w-20"></div>
              <div className="flex gap-2">
                <div className="bg-gray-200 h-8 w-8 rounded"></div>
                <div className="bg-gray-200 h-8 w-12 rounded"></div>
                <div className="bg-gray-200 h-8 w-8 rounded"></div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-gray-200 h-12 rounded flex-1"></div>
              <div className="bg-gray-200 h-12 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 