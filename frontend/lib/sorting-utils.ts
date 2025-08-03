import { Product } from '@/lib/types';

export type SortOption = 
  | 'featured'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'weight_asc'
  | 'weight_desc'
  | 'popularity'
  | 'rating'
  | 'sold_desc';

export interface SortConfig {
  option: SortOption;
  label: string;
  icon: string;
}

/**
 * Sort products based on the specified sort option
 * Uses stable sorting for consistent results
 */
export function sortProducts(products: Product[], sortOption: SortOption): Product[] {
  // Create a copy to avoid mutating the original array
  const sortedProducts = [...products];

  switch (sortOption) {
    case 'featured':
      // Featured products first (isActive = true), then by creation date
      return sortedProducts.sort((a, b) => {
        if (a.isActive !== b.isActive) {
          return a.isActive ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    case 'newest':
      // Sort by creation date (newest first)
      return sortedProducts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case 'price_asc':
      // Sort by price ascending
      return sortedProducts.sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return priceA - priceB;
      });

    case 'price_desc':
      // Sort by price descending
      return sortedProducts.sort((a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return priceB - priceA;
      });

    case 'name_asc':
      // Sort by name ascending (A-Z)
      return sortedProducts.sort((a, b) => 
        a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
      );

    case 'name_desc':
      // Sort by name descending (Z-A)
      return sortedProducts.sort((a, b) => 
        b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' })
      );

    case 'weight_asc':
      // Sort by weight ascending
      return sortedProducts.sort((a, b) => a.weight - b.weight);

    case 'weight_desc':
      // Sort by weight descending
      return sortedProducts.sort((a, b) => b.weight - a.weight);

    case 'popularity':
      // Sort by review count + sold count (popularity score)
      return sortedProducts.sort((a, b) => {
        const popularityA = (a._count?.reviews || 0) + (a.soldCount || 0);
        const popularityB = (b._count?.reviews || 0) + (b.soldCount || 0);
        return popularityB - popularityA;
      });

    case 'rating':
      // Sort by average rating (if reviews exist)
      return sortedProducts.sort((a, b) => {
        const avgRatingA = a.reviews && a.reviews.length > 0 
          ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length
          : 0;
        const avgRatingB = b.reviews && b.reviews.length > 0
          ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length
          : 0;
        return avgRatingB - avgRatingA;
      });

    case 'sold_desc':
      // Sort by sold count descending
      return sortedProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));

    default:
      // Default to featured sorting
      return sortProducts(sortedProducts, 'featured');
  }
}

/**
 * Get sort option configuration
 */
export function getSortConfig(sortOption: SortOption): SortConfig {
  const configs: Record<SortOption, SortConfig> = {
    featured: { option: 'featured', label: 'Nổi bật', icon: 'Star' },
    newest: { option: 'newest', label: 'Mới nhất', icon: 'Clock' },
    price_asc: { option: 'price_asc', label: 'Giá tăng dần', icon: 'ArrowUp' },
    price_desc: { option: 'price_desc', label: 'Giá giảm dần', icon: 'ArrowDown' },
    name_asc: { option: 'name_asc', label: 'Tên A-Z', icon: 'Type' },
    name_desc: { option: 'name_desc', label: 'Tên Z-A', icon: 'Type' },
    weight_asc: { option: 'weight_asc', label: 'Trọng lượng tăng', icon: 'Weight' },
    weight_desc: { option: 'weight_desc', label: 'Trọng lượng giảm', icon: 'Weight' },
    popularity: { option: 'popularity', label: 'Phổ biến nhất', icon: 'TrendingUp' },
    rating: { option: 'rating', label: 'Đánh giá cao nhất', icon: 'Star' },
    sold_desc: { option: 'sold_desc', label: 'Bán chạy nhất', icon: 'ShoppingCart' },
  };

  return configs[sortOption];
}

/**
 * Validate sort option
 */
export function isValidSortOption(option: string): option is SortOption {
  const validOptions: SortOption[] = [
    'featured', 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc',
    'weight_asc', 'weight_desc', 'popularity', 'rating', 'sold_desc'
  ];
  return validOptions.includes(option as SortOption);
}

/**
 * Get default sort option
 */
export function getDefaultSortOption(): SortOption {
  return 'featured';
}

/**
 * Get sort options for display
 */
export function getSortOptions(): Array<{ value: SortOption; label: string; icon: string }> {
  return [
    { value: 'featured', label: 'Nổi bật', icon: 'Star' },
    { value: 'newest', label: 'Mới nhất', icon: 'Clock' },
    { value: 'price_asc', label: 'Giá tăng dần', icon: 'ArrowUp' },
    { value: 'price_desc', label: 'Giá giảm dần', icon: 'ArrowDown' },
    { value: 'name_asc', label: 'Tên A-Z', icon: 'Type' },
    { value: 'name_desc', label: 'Tên Z-A', icon: 'Type' },
    { value: 'weight_asc', label: 'Trọng lượng tăng', icon: 'Weight' },
    { value: 'weight_desc', label: 'Trọng lượng giảm', icon: 'Weight' },
    { value: 'popularity', label: 'Phổ biến nhất', icon: 'TrendingUp' },
    { value: 'rating', label: 'Đánh giá cao nhất', icon: 'Star' },
    { value: 'sold_desc', label: 'Bán chạy nhất', icon: 'ShoppingCart' },
  ];
} 