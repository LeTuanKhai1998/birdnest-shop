import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function PATCH() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      const result = await response.json();
      return NextResponse.json(result);
    } else {
      // For NextAuth users, use the special endpoint
      const user = session.user as any;
      
      const response = await fetch(`${API_BASE_URL}/notifications/nextauth/read-all/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return NextResponse.json(result);
      } else {
        return NextResponse.json(
          { error: 'Failed to mark all notifications as read' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 },
    );
  }
} 