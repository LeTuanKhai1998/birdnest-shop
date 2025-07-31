import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    if (token) {
      // For admin users, use backend API
      const response = await fetch(`${API_BASE_URL}/users/profile/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }
      
      return NextResponse.json({ success: true });
    } else {
      // For NextAuth users, we can't update the database directly from frontend
      return NextResponse.json({ 
        error: 'Password updates should be handled by the backend API' 
      }, { status: 501 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update password' },
      { status: 500 },
    );
  }
}
