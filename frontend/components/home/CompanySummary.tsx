'use client';

import Link from 'next/link';
import { HOME_CONSTANTS } from '@/lib/constants';

export function CompanySummary() {
  return (
    <section className="w-full bg-gradient-to-b from-[#fbd8b0] to-white py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#a10000] mb-4">
              <span className="block lg:hidden">YẾN SÀO KIM SANG</span>
              <span className="block lg:hidden">THƯƠNG HIỆU UY TÍN</span>
              <span className="hidden lg:block">{HOME_CONSTANTS.company.title}</span>
            </h2>
            <div className="w-24 lg:w-1/3 h-1 bg-[#a10000] mx-auto rounded-full"></div>
          </div>

          {/* Star Rating - Positioned right after title */}
          <div className="flex flex-col items-center justify-center mb-12 sm:mb-16">
            {/* Star Rating */}
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                  viewBox="0 0 24 24"
                  fill="url(#premiumGradient)"
                  stroke="url(#premiumGradient)"
                  strokeWidth="0"
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
              <p className="text-base sm:text-lg lg:text-xl text-[#a10000] font-semibold">
                Đánh giá xuất sắc từ hơn 1,000+ khách hàng
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start mb-12 sm:mb-16">
            {/* Left Column - Company Info */}
            <div className="text-left">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 sm:p-10 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-[#a10000] flex items-center">
                  <span className="text-2xl mr-3">🏆</span>
                  Về Chúng Tôi
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-6">
                  {HOME_CONSTANTS.company.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {HOME_CONSTANTS.company.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-[#a10000] font-bold text-base mr-3">✓</span>
                      <span className="font-semibold text-base text-gray-800">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Product Highlights */}
            <div className="text-left">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 sm:p-10 shadow-xl border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-[#a10000] flex items-center">
                  <span className="text-2xl mr-3">🍯</span>
                  Sản Phẩm Chính
                </h3>
                <div className="space-y-4">
                  {HOME_CONSTANTS.company.products.map((product, index) => (
                    <div key={index} className="flex items-start p-4 bg-orange-50 rounded-xl">
                      <div className="w-4 h-4 bg-[#a10000] rounded-full mt-1 mr-4 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-bold text-base text-gray-800 mb-1">{product.title}</h4>
                        <p className="text-base text-gray-600 leading-relaxed">{product.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits Section */}
          <div className="mb-12 sm:mb-16">
            <h3 className="text-2xl font-bold text-center text-[#a10000] mb-8 sm:mb-12">
              Tại Sao Chọn Chúng Tôi?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {HOME_CONSTANTS.company.benefits.map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 text-center shadow-lg border border-white/20">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-[#a10000]">{benefit.title}</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 shadow-xl border border-white/20">
            <h3 className="text-2xl font-bold text-[#a10000] mb-4">
              Sẵn Sàng Trải Nghiệm?
            </h3>
            <p className="text-base text-gray-700 mb-8 max-w-2xl mx-auto">
              Khám phá ngay bộ sản phẩm yến sào cao cấp của chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link
                href="/products"
                className="inline-block bg-[#a10000] text-white font-bold px-10 py-4 rounded-full shadow-lg hover:bg-red-800 transition-all duration-200 text-base hover:scale-105"
              >
                Xem Tất Cả Sản Phẩm
              </Link>
              <Link
                href="/about"
                className="inline-block bg-white text-[#a10000] font-bold px-10 py-4 rounded-full shadow-lg border-2 border-[#a10000] hover:bg-[#a10000] hover:text-white transition-all duration-200 text-base hover:scale-105"
              >
                Tìm Hiểu Thêm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 