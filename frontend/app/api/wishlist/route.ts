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
    
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }
    
    const wishlist = await response.json();
    return NextResponse.json(wishlist);
  } catch (error) {
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
  
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  
  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ productId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to wishlist');
    }
    
    const wishlistItem = await response.json();
    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
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
  
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  
  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ productId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove from wishlist');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 },
    );
  }
}
