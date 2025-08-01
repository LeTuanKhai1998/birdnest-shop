import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  
  console.log('Session:', { 
    hasSession: !!session, 
    hasUser: !!session?.user, 
    hasAccessToken: !!session?.accessToken,
    userEmail: session?.user?.email 
  });
  
  // Check if user is authenticated
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized - Please log in to view order details' }, { status: 401 });
  }

  const accessToken = session.accessToken;

  try {
    // Use JWT authentication with the backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add JWT token from session
    headers['Authorization'] = `Bearer ${accessToken}`;

    console.log('Making request to backend:', `${API_BASE_URL}/orders/${id}`);
    console.log('Headers:', { ...headers, Authorization: 'Bearer [REDACTED]' });

    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers,
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const order = await response.json();
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch order' },
      { status: 500 },
    );
  }
} 