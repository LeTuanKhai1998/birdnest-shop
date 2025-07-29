import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Types for Prisma result
interface PrismaUser {
  name: string | null;
}

interface PrismaReview {
  user: PrismaUser;
  rating: number;
  comment: string | null;
}

interface PrismaImage {
  url: string;
  isPrimary: boolean;
}

interface PrismaCategory {
  name: string;
}

interface PrismaProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: { toString(): string };
  quantity: number;
  images: PrismaImage[];
  category: PrismaCategory;
  reviews: PrismaReview[];
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
    const latestProducts = await prisma.product.findMany({
      where: {
        category: {
          name: {
            not: 'Combo',
          },
        },
      },
      include: {
        images: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    // Fetch all combo products
    const comboProducts = await prisma.product.findMany({
      where: {
        category: {
          name: 'Combo',
        },
      },
      include: {
        images: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match the expected format
    const transformProduct = (product: PrismaProduct): TransformedProduct => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image:
        product.images.find((img) => img.isPrimary)?.url ||
        product.images[0]?.url ||
        '/images/fallback.png',
      images:
        product.images.length > 0
          ? product.images.map((img) => img.url)
          : ['/images/fallback.png'],
      price: parseFloat(product.price.toString()),
      weight: 100, // Default weight, you might want to add this field to your schema
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
