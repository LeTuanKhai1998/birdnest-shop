import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().optional(),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  price: z.number().min(0),
  discount: z.number().min(0).max(100).optional(),
  quantity: z.number().min(0),
  images: z.array(imageSchema), // array of { url, isPrimary }
  categoryId: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        reviews: true,
        images: true, // include images
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = productSchema.parse(body);
    // Create product without images first
    const { images, ...productData } = data;
    const product = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images.map((img: any, i: number) => ({
            url: img.url,
            isPrimary: img.isPrimary ?? i === 0,
          })),
        },
      },
      include: { images: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create product' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, images, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    // Validate product fields (partial)
    const data = productSchema.partial().omit({ images: true }).parse(rest);
    // Update product fields (excluding images)
    const product = await prisma.product.update({ where: { id }, data });
    // Handle images if provided
    if (Array.isArray(images)) {
      // Fetch current images
      const currentImages = await prisma.image.findMany({ where: { productId: id } });
      const newImageUrls = images.map((img: any) => img.url);
      // Delete images that are no longer present
      const toDelete = currentImages.filter((img: any) => !newImageUrls.includes(img.url));
      await prisma.image.deleteMany({ where: { id: { in: toDelete.map((img: any) => img.id) } } });
      // Upsert (update or create) images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const existing = currentImages.find((ci: any) => ci.url === img.url);
        if (existing) {
          await prisma.image.update({
            where: { id: existing.id },
            data: { isPrimary: img.isPrimary ?? i === 0 },
          });
        } else {
          await prisma.image.create({
            data: {
              url: img.url,
              isPrimary: img.isPrimary ?? i === 0,
              productId: id,
            },
          });
        }
      }
      // Ensure only one isPrimary
      const primaryImages = images.filter((img: any) => img.isPrimary);
      if (primaryImages.length === 0 && images.length > 0) {
        // Set first image as primary if none marked
        const firstImg = await prisma.image.findFirst({ where: { productId: id, url: images[0].url } });
        if (firstImg) {
          await prisma.image.update({ where: { id: firstImg.id }, data: { isPrimary: true } });
        }
      } else if (primaryImages.length > 1) {
        // Only one should be primary
        const firstPrimary = images.find((img: any) => img.isPrimary);
        for (const img of images) {
          if (img.url !== firstPrimary.url) {
            const dbImg = await prisma.image.findFirst({ where: { productId: id, url: img.url } });
            if (dbImg) await prisma.image.update({ where: { id: dbImg.id }, data: { isPrimary: false } });
          }
        }
      }
    }
    // Return updated product with images
    const updated = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update product' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete product' }, { status: 400 });
  }
} 