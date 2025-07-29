'use client';

import Image from 'next/image';

const featureIcons = [
  {
    icon: '/images/banner_decor_1.png',
    label: 'Chất Lượng Thượng Hạng',
  },
  {
    icon: '/images/body_decor_1.png',
    label: 'Tận Tâm Khách Hàng',
  },
  {
    icon: '/images/logo.png',
    label: 'Thương Hiệu Uy Tín',
  },
];

export function FeatureIcons() {
  return (
    <section className="w-full bg-[#fbd8b0] py-4 sm:py-6 flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
        {featureIcons.map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center min-w-[100px] sm:min-w-0"
          >
            <Image
              src={f.icon}
              alt={f.label}
              width={48}
              height={48}
              className="mb-2 w-8 h-8 sm:w-12 sm:h-12"
            />
            <span className="text-sm sm:text-base font-semibold text-[#a10000] text-center max-w-[100px] sm:max-w-[120px] leading-tight">
              {f.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
} 