import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use JWT authentication with the backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add JWT token from session
    if (session.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const orders = await response.json();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json([]);
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
    // Use JWT authentication with the backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add JWT token from session
    if (session.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order');
    }
    
    const order = await response.json();
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Order update failed' },
      { status: 500 },
    );
  }
}
