import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Define proper types for user session
interface UserSession {
  id: string;
  email?: string;
  name?: string;
}

export async function PATCH(
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
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      const notification = await response.json();
      return NextResponse.json(notification);
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as UserSession;
      
      const response = await fetch(`${API_BASE_URL}/notifications/nextauth/${id}/read/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const notification = await response.json();
        return NextResponse.json(notification);
      } else {
        return NextResponse.json(
          { error: 'Failed to mark notification as read' },
          { status: 404 }
        );
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 },
    );
  }
} 