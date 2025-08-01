import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types for API result
interface ApiUser {
  name: string | null;
}

interface ApiReview {
  user: ApiUser;
  rating: number;
  comment: string | null;
}

interface ApiImage {
  url: string;
  isPrimary: boolean;
}

interface ApiCategory {
  name: string;
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  quantity: number;
  weight: number;
  images: ApiImage[];
  category: ApiCategory;
  reviews: ApiReview[];
}

// Type for transformed product
interface TransformedProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  images: string[];
  price: number;
  weight: number;
  description: string;
  type: string;
  quantity: number;
  reviews: { user: string; rating: number; comment: string }[];
  sold: number;
}

export async function GET() {
  try {
    // Fetch latest products (excluding combos) - limit to 4
    const latestProductsResponse = await fetch(`${API_BASE_URL}/products?categoryId=latest&take=4`);
    if (!latestProductsResponse.ok) {
      throw new Error('Failed to fetch latest products');
    }
    const latestProducts: ApiProduct[] = await latestProductsResponse.json();

    // Fetch all combo products
    const comboProductsResponse = await fetch(`${API_BASE_URL}/products?categoryId=combo`);
    if (!comboProductsResponse.ok) {
      throw new Error('Failed to fetch combo products');
    }
    const comboProducts: ApiProduct[] = await comboProductsResponse.json();

    // Transform data to match the expected format
    const transformProduct = (product: ApiProduct): TransformedProduct => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url ||
        '/images/placeholder-image.svg',
      images:
        product.images.length > 0
          ? product.images.map((img) => img.url)
          : ['/images/placeholder-image.svg'],
      price: parseFloat(product.price),
      weight: product.weight || 100,
      description: product.description,
      type: product.category.name,
      quantity: product.quantity,
      reviews: product.reviews.map((review) => ({
        user: review.user.name || 'Anonymous',
        rating: review.rating,
        comment: review.comment || '',
      })),
      sold: 0, // You might want to calculate this from orderItems
    });

    return NextResponse.json({
      latestProducts: latestProducts.map(transformProduct),
      comboProducts: comboProducts.map(transformProduct),
    });
  } catch (error) {
    console.error('Error fetching home products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}
