import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ProductCartItem = {
  product: { id: string; price: number };
  quantity: number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { info, products, deliveryFee, paymentMethod } = body;
  if (!info || !products || !products.length) {
    return NextResponse.json({ error: "Missing order data" }, { status: 400 });
  }

  // Defensive check: ensure all product IDs exist
  const productIds = (products as ProductCartItem[]).map((item: ProductCartItem) => item.product.id);
  const foundProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (foundProducts.length !== productIds.length) {
    return NextResponse.json({ error: "One or more products not found in database. Please refresh your cart." }, { status: 400 });
  }

  // Compose shipping address string
  const shippingAddress = [
    info.fullName,
    info.phone,
    info.email,
    info.province,
    info.district,
    info.ward,
    info.address,
    info.apartment,
    info.note
  ].filter(Boolean).join(", ");

  // Calculate total
  const subtotal = products.reduce((sum: number, item: ProductCartItem) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + (deliveryFee || 0);

  // Create order and order items
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      status: "PENDING",
      paymentMethod: paymentMethod?.toUpperCase() || "COD",
      shippingAddress,
      orderItems: {
        create: (products as ProductCartItem[]).map((item: ProductCartItem) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: {
      orderItems: true,
    },
  });

  return NextResponse.json({ order });
} 