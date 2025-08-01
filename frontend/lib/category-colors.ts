// Category color mapping for consistent styling across the application
export const CATEGORY_COLORS = {
  // Original names (keep for backward compatibility)
  'Tổ yến tinh chế': 'bg-blue-100 text-blue-800 border-blue-200',
  'Tổ yến thô': 'bg-green-100 text-green-800 border-green-200',
  'Tổ yến đã làm sạch lông': 'bg-purple-100 text-purple-800 border-purple-200',
  'Combo quà tặng': 'bg-orange-100 text-orange-800 border-orange-200',
  'Tổ yến cao cấp': 'bg-red-100 text-red-800 border-red-200',
  'Tổ yến thường': 'bg-gray-100 text-gray-800 border-gray-200',
  'Tổ yến đặc biệt': 'bg-pink-100 text-pink-800 border-pink-200',
  'Tổ yến hảo hạng': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  
  // Actual category names from the database
  'Yến tinh chế': 'bg-blue-100 text-blue-800 border-blue-200',
  'Yến thô': 'bg-green-100 text-green-800 border-green-200',
  'Yến baby': 'bg-purple-100 text-purple-800 border-purple-200',
  'Yến hũ': 'bg-orange-100 text-orange-800 border-orange-200',
  'Yến cao cấp': 'bg-red-100 text-red-800 border-red-200',
  'Yến thường': 'bg-gray-100 text-gray-800 border-gray-200',
  'Yến đặc biệt': 'bg-pink-100 text-pink-800 border-pink-200',
  'Yến hảo hạng': 'bg-indigo-100 text-indigo-800 border-indigo-200',
} as const;

// Helper function to get category color classes
export function getCategoryColor(categoryName: string | null | undefined, customColorScheme?: string | null): string {
  if (!categoryName) {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  // If custom color scheme is provided from database, use it
  if (customColorScheme) {
    return customColorScheme;
  }
  
  // Otherwise, fall back to hardcoded colors
  return CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS] || 
         'bg-gray-100 text-gray-800 border-gray-200';
}

// Helper function to get category text color only
export function getCategoryTextColor(categoryName: string | null | undefined, customColorScheme?: string | null): string {
  if (!categoryName) {
    return 'text-gray-800';
  }
  
  // If custom color scheme is provided from database, extract text color from it
  if (customColorScheme) {
    const textColorMatch = customColorScheme.match(/text-(\w+)-\d+/);
    return textColorMatch ? `text-${textColorMatch[1]}-800` : 'text-gray-800';
  }
  
  const colorClass = CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS];
  if (!colorClass) {
    return 'text-gray-800';
  }
  
  // Extract text color from the full class
  const textColorMatch = colorClass.match(/text-(\w+)-\d+/);
  return textColorMatch ? `text-${textColorMatch[1]}-800` : 'text-gray-800';
}

// Helper function to get category background color only
export function getCategoryBgColor(categoryName: string | null | undefined, customColorScheme?: string | null): string {
  if (!categoryName) {
    return 'bg-gray-100';
  }
  
  // If custom color scheme is provided from database, extract background color from it
  if (customColorScheme) {
    const bgColorMatch = customColorScheme.match(/bg-(\w+)-\d+/);
    return bgColorMatch ? `bg-${bgColorMatch[1]}-100` : 'bg-gray-100';
  }
  
  const colorClass = CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS];
  if (!colorClass) {
    return 'bg-gray-100';
  }
  
  // Extract background color from the full class
  const bgColorMatch = colorClass.match(/bg-(\w+)-\d+/);
  return bgColorMatch ? `bg-${bgColorMatch[1]}-100` : 'bg-gray-100';
} 