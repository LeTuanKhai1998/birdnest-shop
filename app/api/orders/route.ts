import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
};
type Order = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  orderItems: OrderItem[];
};

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const prismaOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const orders: Order[] = prismaOrders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    total: Number(order.total),
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        name: item.product.name,
        images: item.product.images,
      },
    })),
  }));

  return NextResponse.json({ orders });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: "Order update failed" }, { status: 500 });
  }
} 