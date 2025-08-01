import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Define proper types for user session
interface UserSession {
  id: string;
  email?: string;
  name?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      const order = await response.json();
      return NextResponse.json(order);
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as UserSession;
      
      const response = await fetch(`${API_BASE_URL}/orders/nextauth/${id}/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const order = await response.json();
        return NextResponse.json(order);
      } else {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 },
    );
  }
} 