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
    // For NextAuth users, we need to get the user ID from the session
    // and make a request to the backend API
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID not found in session' 
      }, { status: 400 });
    }
    
    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/users/profile/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // For NextAuth users, we'll need to pass the user ID in the request
        // since we don't have a JWT token
      },
      body: JSON.stringify({ 
        userId,
        currentPassword, 
        newPassword 
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update password' },
      { status: 500 },
    );
  }
}
