import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
}

// GET: List all addresses for current user
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(addresses);
}

// POST: Create new address
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const data = await req.json();
  // If isDefault, unset previous default
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const address = await prisma.address.create({ data: { ...data, userId } });
  return NextResponse.json(address);
}

// PATCH: Update address
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const { id, ...data } = await req.json();
  // Only allow updating user's own address
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const updated = await prisma.address.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE: Delete address
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id;
  const { id } = await req.json();
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 