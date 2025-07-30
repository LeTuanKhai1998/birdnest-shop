import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductsClient from '@/components/ProductsClient';
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

function isImageObject(
  img: unknown,
): img is { url: string; isPrimary?: boolean } {
  return typeof img === 'object' && img !== null && 'url' in img;
}

export default async function ProductsPage() {
  // Fetch products from the database
  const dbProducts = await prisma.product.findMany({
    include: { 
      images: true,
      category: true 
    },
    orderBy: { createdAt: 'desc' },
  });
  // Map DB fields to ProductCard props
  const uiProducts = dbProducts.map((p) => {
    if (Array.isArray(p.images) && p.images.length > 0) {
      const imageObjs = p.images.filter((img) => isImageObject(img));
      if (imageObjs.length > 0) {
        const images: string[] = [
          ...imageObjs.filter((img) => img.isPrimary).map((img) => img.url),
          ...imageObjs.filter((img) => !img.isPrimary).map((img) => img.url),
        ];
        return {
          id: String(p.id),
          slug: String(p.slug),
          name: String(p.name),
          images,
          price: Number(p.price),
          description: String(p.description),
          weight: (() => {
            if (typeof p.name === 'string' && p.name.includes('50g')) return 50;
            if (typeof p.name === 'string' && p.name.includes('100g'))
              return 100;
            if (typeof p.name === 'string' && p.name.includes('200g'))
              return 200;
            return 50;
          })(),
          type: (() => {
            // Map category names to filter values
            if (p.category?.name === 'Yến hủ') return 'Yến tinh chế';
            if (p.category?.name === 'Yến tinh') return 'Yến rút lông';
            if (p.category?.name === 'Yến baby') return 'Tổ yến thô';
            return 'Khác';
          })(),
          quantity: typeof p.quantity === 'number' ? p.quantity : 0,
          reviews: [],
          sold: 0,
          categoryId: String(p.categoryId),
          category: p.category ? {
            id: String(p.category.id),
            name: String(p.category.name),
            slug: String(p.category.slug),
          } : undefined,
        };
      }
    }
    return {
      id: String(p.id),
      slug: String(p.slug),
      name: String(p.name),
      images: [FALLBACK_IMAGE],
      price: Number(p.price),
      description: String(p.description),
      weight: (() => {
        if (typeof p.name === 'string' && p.name.includes('50g')) return 50;
        if (typeof p.name === 'string' && p.name.includes('100g')) return 100;
        if (typeof p.name === 'string' && p.name.includes('200g')) return 200;
        return 50;
      })(),
      type: (() => {
        // Map category names to filter values
        if (p.category?.name === 'Yến hủ') return 'Yến tinh chế';
        if (p.category?.name === 'Yến tinh') return 'Yến rút lông';
        if (p.category?.name === 'Yến baby') return 'Tổ yến thô';
        return 'Khác';
      })(),
      quantity: typeof p.quantity === 'number' ? p.quantity : 0,
      reviews: [],
      sold: 0,
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
}
