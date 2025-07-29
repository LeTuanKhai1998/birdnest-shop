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
                fill="url(#premiumGradient)"
                stroke="url(#premiumGradient)"
                strokeWidth="0"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
              >
                <defs>
                  <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="20%" stopColor="#FFA500" />
                    <stop offset="40%" stopColor="#FFD700" />
                    <stop offset="60%" stopColor="#FFA500" />
                    <stop offset="80%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                  </linearGradient>
                </defs>
                <path d="M12 1.5l2.5 5.1 5.6 0.8-4.1 4 1 5.8L12 15.3l-5 2.8 1-5.8-4.1-4 5.6-0.8L12 1.5z" />
              </svg>
            ))}
          </div>
          
          {/* Rating Text */}
          <div className="text-center">
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium">
              Đánh giá xuất sắc từ hơn 1,000+ khách hàng
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 