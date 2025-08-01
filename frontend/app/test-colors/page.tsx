'use client';

import { getCategoryColor, getCategoryTextColor, getCategoryBgColor } from '@/lib/category-colors';
import { cn } from '@/lib/utils';

export default function TestColorsPage() {
  const testCategories = [
    'Yến tinh chế',
    'Yến thô', 
    'Yến baby',
    'Yến hũ',
    'Yến cao cấp',
    'Yến thường',
    'Yến đặc biệt',
    'Yến hảo hạng'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Trang Kiểm Tra Màu Sắc</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Kiểm tra danh mục với màu sắc:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testCategories.map((category) => (
              <div key={category} className="space-y-2">
                <div className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium",
                  getCategoryColor(category)
                )}>
                  {category}
                </div>
                <p className="text-xs text-gray-500">
                  Lớp CSS: {getCategoryColor(category)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Kiểm tra màu sắc thủ công:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Xanh dương
            </div>
            <div className="bg-green-100 text-green-800 border-green-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Xanh lá
            </div>
            <div className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Tím
            </div>
            <div className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Cam
            </div>
            <div className="bg-red-100 text-red-800 border-red-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Đỏ
            </div>
            <div className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Xám
            </div>
            <div className="bg-pink-100 text-pink-800 border-pink-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Hồng
            </div>
            <div className="bg-indigo-100 text-indigo-800 border-indigo-200 px-3 py-2 rounded-lg border text-sm font-medium">
              Chàm
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Kiểm tra chỉ nền:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testCategories.map((category) => (
              <div key={category} className="space-y-2">
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium text-gray-800",
                  getCategoryBgColor(category)
                )}>
                  {category}
                </div>
                <p className="text-xs text-gray-500">
                  Nền: {getCategoryBgColor(category)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Kiểm tra chỉ màu chữ:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testCategories.map((category) => (
              <div key={category} className="space-y-2">
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium bg-gray-100",
                  getCategoryTextColor(category)
                )}>
                  {category}
                </div>
                <p className="text-xs text-gray-500">
                  Chữ: {getCategoryTextColor(category)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 