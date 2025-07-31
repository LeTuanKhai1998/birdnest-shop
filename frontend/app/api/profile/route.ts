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
        avatar: user.avatar || '',
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
      // For NextAuth users, use the special endpoint that doesn't require JWT
      const userId = (session.user as SessionUser).id;
      if (!userId) {
        return NextResponse.json({ 
          error: 'User ID not found in session' 
        }, { status: 400 });
      }
      
      // Add userId to the data for the backend to identify the user
      const updateData = {
        ...data,
        userId: userId
      };
      
      // Use the NextAuth-specific endpoint
      const response = await fetch(`${API_BASE_URL}/users/profile/nextauth`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const user = await response.json();
      return NextResponse.json(user);
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
