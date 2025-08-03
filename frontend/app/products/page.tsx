import { Metadata } from 'next';
import ProductsClient from '@/components/ProductsClient';
import { getProducts } from '@/lib/api-server';
import { SEO_CONSTANTS } from '@/lib/constants';
import { Product } from '@/lib/types';

const FALLBACK_IMAGE = '/images/placeholder-image.svg';

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
    // Fetch products from the backend API
    const dbProducts = await getProducts();
    
    // If no products returned, continue with empty array
    if (!dbProducts || dbProducts.length === 0) {
      return <ProductsClient products={[]} />;
    }
    
    // Map backend API response to frontend Product interface
    const uiProducts: Product[] = dbProducts.map((p: any) => {
      // Handle images - backend returns Image[] with url and isPrimary fields
      const images = p.images && Array.isArray(p.images) && p.images.length > 0 
        ? p.images.map((img: any) => {
            if (typeof img === 'string') return img;
            if (typeof img === 'object' && img.url) return img.url;
            return FALLBACK_IMAGE;
          })
        : [FALLBACK_IMAGE];
      
      // Get primary image or first image as main image
      const primaryImage = p.images?.find((img: any) => img.isPrimary)?.url || images[0];
      
      // Map weight from backend (default to 100 if not present)
      const weight = typeof p.weight === 'number' ? p.weight : 100;
      
      // Map category information
      const category = p.category ? {
        id: String(p.category.id),
        name: String(p.category.name),
        slug: String(p.category.slug),
        colorScheme: p.category.colorScheme,
        createdAt: p.category.createdAt,
        updatedAt: p.category.updatedAt,
      } : undefined;
      
      // Map reviews if present
      const reviews = p.reviews && Array.isArray(p.reviews) 
        ? p.reviews.map((review: any) => ({
            id: String(review.id),
            userId: String(review.userId),
            productId: String(review.productId),
            rating: Number(review.rating),
            comment: review.comment,
            createdAt: review.createdAt,
            user: {
              id: String(review.user?.id || review.userId),
              name: String(review.user?.name || 'Anonymous'),
            },
          }))
        : [];
      
      return {
        id: String(p.id),
        readableId: p.readableId,
        slug: String(p.slug),
        name: String(p.name),
        description: String(p.description),
        price: String(p.price),
        discount: typeof p.discount === 'number' ? p.discount : 0,
        quantity: typeof p.quantity === 'number' ? p.quantity : 0,
        weight: weight,
        categoryId: String(p.categoryId),
        isActive: Boolean(p.isActive),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        category: category,
        image: primaryImage, // Main image for ProductCard
        images: images, // All images array
        reviews: reviews,
        soldCount: typeof p.soldCount === 'number' ? p.soldCount : 0,
        sold: typeof p.soldCount === 'number' ? p.soldCount : 0, // For backward compatibility
        type: category?.name || 'Khác', // Use category name as type for filtering
        _count: {
          reviews: typeof p._count?.reviews === 'number' ? p._count.reviews : reviews.length,
        },
      };
    });
    
    return <ProductsClient products={uiProducts} />;
  } catch (error) {
    // Return empty products array on error
    return <ProductsClient products={[]} />;
  }
}
