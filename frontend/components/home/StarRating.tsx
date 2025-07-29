'use client';

export function StarRating() {
  return (
    <section className="w-full py-10 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Star Rating */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 drop-shadow-lg filter"
                viewBox="0 0 24 24"
                fill="url(#metalGradient)"
                stroke="url(#metalGradient)"
                strokeWidth="0"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
              >
                <defs>
                  <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="25%" stopColor="#FFA500" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="75%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          
          {/* Rating Text */}
          <div className="text-center">
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium">
              Đánh giá xuất sắc từ hơn 1,000+ khách hàng
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="flex items-center gap-6 sm:gap-8 mt-6 sm:mt-8">
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-md"></div>
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 