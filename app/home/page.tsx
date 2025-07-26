import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { prisma } from "@/lib/prisma";
import { ProductCardList } from "@/components/ProductCardList";

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

const banners = [
  { src: "/images/banner1.png", alt: "Premium Birdnest Banner 1" },
  { src: "/images/banner2.png", alt: "Gift Combo Banner 2" },
  { src: "/images/banner3.png", alt: "Promotion Banner 3" },
];

export default async function HomePage() {
  // Fetch data server-side
  const latestProducts = await prisma.product.findMany({
    where: {
      category: {
        name: {
          not: 'Combo'
        }
      }
    },
    include: {
      images: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 4
  });

  const comboProducts = await prisma.product.findMany({
    where: {
      category: {
        name: 'Combo'
      }
    },
    include: {
      images: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
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
    weight: 100, // Default weight
    description: product.description,
    type: product.category.name,
    quantity: product.quantity,
    reviews: product.reviews.map((review) => ({
      user: review.user.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment || ''
    })),
    sold: 0
  });

  const transformedLatestProducts: TransformedProduct[] = latestProducts.map(transformProduct);
  const transformedComboProducts: TransformedProduct[] = comboProducts.map(transformProduct);

  return (
    <div className="space-y-12">
      {/* Banner Carousel */}
      <section className="container mx-auto px-4 flex justify-center items-center">
        <div className="w-full">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between py-2 px-2 md:py-4">
            {banners.map((banner, i) => (
              <Card key={banner.src} className="w-full rounded-2xl overflow-hidden shadow-xl border-0">
                <CardContent className="p-0 m-0 border-0">
                  <AspectRatio ratio={16 / 7}>
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      fill
                      className="object-contain object-center w-full h-full rounded-2xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1152px"
                      priority={i === 0}
                    />
                  </AspectRatio>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-red-700">Latest Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-4">
          <ProductCardList products={transformedLatestProducts} />
        </div>
      </section>

      {/* Premium Combos */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-yellow-700">Premium Birdnest Combos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-4">
          <ProductCardList products={transformedComboProducts} />
        </div>
      </section>
    </div>
  );
} 