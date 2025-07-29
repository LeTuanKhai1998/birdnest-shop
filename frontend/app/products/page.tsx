import { prisma } from '@/lib/prisma';
import ProductsClient from '@/components/ProductsClient';
import {
  mapDisplayProducts,
  MockUiProduct,
  mockUiProducts,
} from '@/lib/products-mapper';

const FALLBACK_IMAGE = '/images/placeholder.png';

function isImageObject(
  img: unknown,
): img is { url: string; isPrimary?: boolean } {
  return typeof img === 'object' && img !== null && 'url' in img;
}

export default async function ProductsPage() {
  // Fetch products from the database
  const dbProducts = await prisma.product.findMany({
    include: { images: true },
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
            if (typeof p.name === 'string' && p.name.includes('tinh chế'))
              return 'Yến tinh chế';
            if (typeof p.name === 'string' && p.name.includes('rút lông'))
              return 'Yến rút lông';
            if (typeof p.name === 'string' && p.name.includes('thô'))
              return 'Tổ yến thô';
            return 'Khác';
          })(),
          quantity: typeof p.quantity === 'number' ? p.quantity : 0,
          reviews: [],
          sold: 0,
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
        if (typeof p.name === 'string' && p.name.includes('tinh chế'))
          return 'Yến tinh chế';
        if (typeof p.name === 'string' && p.name.includes('rút lông'))
          return 'Yến rút lông';
        if (typeof p.name === 'string' && p.name.includes('thô'))
          return 'Tổ yến thô';
        return 'Khác';
      })(),
      quantity: typeof p.quantity === 'number' ? p.quantity : 0,
      reviews: [],
      sold: 0,
    };
  });
  const displayProducts: MockUiProduct[] = mapDisplayProducts(
    uiProducts,
    mockUiProducts,
    FALLBACK_IMAGE,
  );
  return <ProductsClient products={displayProducts} />;
}
