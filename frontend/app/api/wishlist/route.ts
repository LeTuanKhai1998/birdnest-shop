import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    });
    return NextResponse.json(wishlist);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  try {
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: { product: true },
    });
    return NextResponse.json(wishlistItem, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  try {
    await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 },
    );
  }
}
