import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users - list users (with optional query params for pagination/filter)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const role = searchParams.get('role');
  const where: Prisma.UserWhereInput = {};
  if (role) where.isAdmin = role === 'admin';
  const users = await prisma.user.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({ where });
  return NextResponse.json({ users, total, page, pageSize });
}

// PATCH /api/users/:id - update user (role/status)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, isAdmin } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(isAdmin !== undefined ? { isAdmin } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ user });
}

// DELETE /api/users/:id - delete user
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 