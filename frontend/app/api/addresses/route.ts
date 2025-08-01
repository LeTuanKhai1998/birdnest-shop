import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
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
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      
      const addresses = await response.json();
      return NextResponse.json(addresses);
    } else {
      // For NextAuth users, use backend API with userId
      const user = session.user as SessionUser;
      
      try {
        const response = await fetch(`${API_BASE_URL}/addresses/nextauth/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const addresses = await response.json();
          return NextResponse.json(addresses);
        } else {
          // Return empty array if no addresses found
          return NextResponse.json([]);
        }
      } catch {
        // Return empty array if backend fails
        return NextResponse.json([]);
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await req.json();
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create address');
      }
      
      const address = await response.json();
      return NextResponse.json(address);
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as SessionUser;
      
      const response = await fetch(`${API_BASE_URL}/addresses/nextauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create address');
      }
      
      const address = await response.json();
      return NextResponse.json(address);
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await req.json();
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/addresses/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update address');
      }
      
      const address = await response.json();
      return NextResponse.json(address);
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as SessionUser;
      
      const response = await fetch(`${API_BASE_URL}/addresses/nextauth/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update address');
      }
      
      const address = await response.json();
      return NextResponse.json(address);
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete address');
      }
      
      return NextResponse.json({ message: 'Address deleted successfully' });
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as SessionUser;
      
      const response = await fetch(`${API_BASE_URL}/addresses/nextauth/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete address');
      }
      
      return NextResponse.json({ message: 'Address deleted successfully' });
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 },
    );
  }
}
