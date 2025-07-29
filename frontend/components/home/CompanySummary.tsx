'use client';

import Link from 'next/link';
import { HOME_CONSTANTS } from '@/lib/constants';

export function CompanySummary() {
  return (
    <section className="w-full bg-gradient-to-b from-[#fbd8b0] to-white py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#a10000]">
            {HOME_CONSTANTS.company.title}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-8">
            {/* Left Column - Company Info */}
            <div className="text-left space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-[#a10000]">
                  🏆 Về Chúng Tôi
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {HOME_CONSTANTS.company.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {HOME_CONSTANTS.company.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-[#a10000] font-semibold">✓</span>
                      <span className="ml-2">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Product Highlights */}
            <div className="text-left space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-[#a10000]">
                  🍯 Sản Phẩm Chính
                </h3>
                <div className="space-y-3">
                  {HOME_CONSTANTS.company.products.map((product, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-3 h-3 bg-[#a10000] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{product.title}</h4>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {HOME_CONSTANTS.company.benefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-[#a10000]">{benefit.title}</h3>
                <p className="text-sm text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-10 text-center">
            <p className="text-lg text-gray-700 mb-6">
              Khám phá ngay bộ sản phẩm yến sào cao cấp của chúng tôi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-block bg-[#a10000] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-red-800 transition-colors duration-200"
              >
                Xem Tất Cả Sản Phẩm
              </Link>
              <Link
                href="/about"
                className="inline-block bg-white text-[#a10000] font-bold px-8 py-3 rounded-full shadow-lg border-2 border-[#a10000] hover:bg-[#a10000] hover:text-white transition-colors duration-200"
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