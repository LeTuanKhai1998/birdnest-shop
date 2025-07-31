import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// GET: List all addresses for current user
export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }
    
    const addresses = await response.json();
    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 },
    );
  }
}

// POST: Create new address
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const data = await req.json();
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create address');
    }
    
    const address = await response.json();
    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 },
    );
  }
}

// PATCH: Update address
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id, ...data } = await req.json();
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update address');
    }
    
    const address = await response.json();
    return NextResponse.json(address);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 },
    );
  }
}

// DELETE: Delete address
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const { id } = await req.json();
    
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 },
    );
  }
}
