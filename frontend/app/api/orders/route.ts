import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { mapOrderToApi } from '@/lib/order-mapper';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const prismaOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  });

  const orders = prismaOrders.map(mapOrderToApi);

  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json(
      { error: 'Missing id or status' },
      { status: 400 },
    );
  }
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, order });
  } catch {
    return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
  }
}
