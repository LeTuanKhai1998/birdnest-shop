import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get auth token from request headers or session
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null);
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }
    
    const product = await response.json();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create product',
      },
      { status: 400 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing product id' },
        { status: 400 },
      );
    }
    
    // Get auth token from request headers or session
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null);
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }
    
    const product = await response.json();
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update product',
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing product id' },
        { status: 400 },
      );
    }
    
    // Get auth token from request headers or session
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                  (typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null);
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete product',
      },
      { status: 400 },
    );
  }
}
