import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
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
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const user = await response.json();
      return NextResponse.json(user);
    } else {
      // For NextAuth users, return the session data directly
      const user = session.user as SessionUser;
      
      return NextResponse.json({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: '', // Will be updated when user fills the form
        bio: '',   // Will be updated when user fills the form
        avatar: (user as any).avatar || '',
        createdAt: new Date().toISOString(), // Default to current date
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const user = await response.json();
      return NextResponse.json(user);
    } else {
      // For NextAuth users, we can't update the database directly from frontend
      return NextResponse.json({ 
        error: 'Profile updates should be handled by the backend API' 
      }, { status: 501 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
