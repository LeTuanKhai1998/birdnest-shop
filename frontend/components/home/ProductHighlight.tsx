'use client';

import Image from 'next/image';
import Link from 'next/link';

export function ProductHighlight() {
  return (
    <section className="w-full bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-red-700">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="relative">
            <div className="relative w-full max-w-2xl mx-auto">
              <Image
                src="/images/yen_banner_1.png"
                alt="Yến Sào Kim Sang Premium"
                width={600}
                height={600}
                className="w-full h-auto object-contain drop-shadow-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-transparent pointer-events-none"></div>
            </div>
            <div className="mt-6 sm:mt-8">
              <Link
                href="/products"
                className="inline-block bg-[#a10000] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-red-800 transition-colors duration-200"
              >
                Khám Phá Ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 