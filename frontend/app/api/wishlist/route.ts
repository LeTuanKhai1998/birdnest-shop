import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Define proper types for user session
interface UserSession {
  id: string;
  email?: string;
  name?: string;
}

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
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const wishlist = await response.json();
      return NextResponse.json(wishlist);
    } else {
      // For NextAuth users, use backend API with userId
      const user = session.user as UserSession;
      
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/nextauth/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const wishlist = await response.json();
          return NextResponse.json(wishlist);
        } else {
          // Return empty array if no wishlist found
          return NextResponse.json([]);
        }
      } catch {
        // Return empty array if backend fails
        return NextResponse.json([]);
      }
    }
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
  
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  
  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }
      
      const wishlistItem = await response.json();
      return NextResponse.json(wishlistItem, { status: 201 });
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as UserSession;
      
      const response = await fetch(`${API_BASE_URL}/wishlist/nextauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }
      
      const wishlistItem = await response.json();
      return NextResponse.json(wishlistItem, { status: 201 });
    }
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
  
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  
  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
      
      return NextResponse.json({ success: true });
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as UserSession;
      
      const response = await fetch(`${API_BASE_URL}/wishlist/nextauth`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
      
      return NextResponse.json({ success: true });
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 },
    );
  }
}
