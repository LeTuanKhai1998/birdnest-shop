import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// GET /api/users - list users (with optional query params for pagination/filter)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';
    const role = searchParams.get('role');
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const queryParams = new URLSearchParams({
      skip: ((parseInt(page) - 1) * parseInt(pageSize)).toString(),
      take: pageSize,
      ...(role && { role }),
    });
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

// PATCH /api/users/:id - update user (role/status)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id, isAdmin } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/users/${id}/admin-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ isAdmin }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    
    const user = await response.json();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

// DELETE /api/users/:id - delete user
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}
