import { Metadata } from 'next';
import ProductsClient from '@/components/ProductsClient';
import { apiService } from '@/lib/api';
import {
  mapDisplayProducts,
  MockUiProduct,
  mockUiProducts,
} from '@/lib/products-mapper';
import { SEO_CONSTANTS } from '@/lib/constants';

const FALLBACK_IMAGE = '/images/placeholder.png';

// SEO Metadata
export const metadata: Metadata = {
  title: SEO_CONSTANTS.products.title,
  description: SEO_CONSTANTS.products.description,
  keywords: SEO_CONSTANTS.products.keywords,
  openGraph: {
    title: SEO_CONSTANTS.products.title,
    description: SEO_CONSTANTS.products.description,
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONSTANTS.products.title,
    description: SEO_CONSTANTS.products.description,
  },
};

export default async function ProductsPage() {
  try {
    // Fetch products from the API
    const dbProducts = await apiService.getProducts();
    
    // Map API response to UI format
    const uiProducts = dbProducts.map((p) => {
      const images = p.images && Array.isArray(p.images) && p.images.length > 0 
        ? p.images.map(img => typeof img === 'string' ? img : img.url)
        : [FALLBACK_IMAGE];
      
      return {
        id: String(p.id),
        slug: String(p.slug),
        name: String(p.name),
        images,
        price: Number(p.price),
        description: String(p.description),
        weight: (() => {
          if (typeof p.name === 'string' && p.name.includes('50g')) return 50;
          if (typeof p.name === 'string' && p.name.includes('100g')) return 100;
          if (typeof p.name === 'string' && p.name.includes('200g')) return 200;
          return 50;
        })(),
        type: p.category?.name || 'Khác',
        quantity: typeof p.quantity === 'number' ? p.quantity : 0,
        reviews: p.reviews || [],
        sold: 0, // Default value since sold is not in the Product interface
        categoryId: String(p.categoryId),
        category: p.category ? {
          id: String(p.category.id),
          name: String(p.category.name),
          slug: String(p.category.slug),
        } : undefined,
      };
    });
    
    const displayProducts: MockUiProduct[] = mapDisplayProducts(
      uiProducts,
      mockUiProducts,
      FALLBACK_IMAGE,
    );
    
    return <ProductsClient products={displayProducts} />;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to mock products if API fails
    const displayProducts: MockUiProduct[] = mapDisplayProducts(
      [],
      mockUiProducts,
      FALLBACK_IMAGE,
    );
    return <ProductsClient products={displayProducts} />;
  }
}
