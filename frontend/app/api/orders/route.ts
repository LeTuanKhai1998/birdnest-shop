import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const orders = await response.json();
      return NextResponse.json({ orders });
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as any;
      
      const response = await fetch(`${API_BASE_URL}/orders/nextauth/my-orders/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const orders = await response.json();
        return NextResponse.json({ orders });
      } else {
        // Return empty array if no orders found
        return NextResponse.json({ orders: [] });
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
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
    // Get auth token from localStorage (for admin users) or use session for NextAuth users
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    
    const order = await response.json();
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: 'Order update failed' },
      { status: 500 },
    );
  }
}
