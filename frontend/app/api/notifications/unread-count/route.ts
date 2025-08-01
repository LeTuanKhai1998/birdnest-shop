import { NextResponse } from 'next/server';
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
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      
      const count = await response.json();
      return NextResponse.json(count);
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as UserSession;
      
      const response = await fetch(`${API_BASE_URL}/notifications/nextauth/unread-count/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const count = await response.json();
        return NextResponse.json(count);
      } else {
        // Return 0 if no unread notifications found
        return NextResponse.json(0);
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 },
    );
  }
} 