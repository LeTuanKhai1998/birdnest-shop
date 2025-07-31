import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

type ProductCartItem = {
  product: { id: string; price: number };
  quantity: number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { info, products, deliveryFee, paymentMethod } = body;
  if (!info || !products || !products.length) {
    return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
  }

  try {
    // Get auth token from localStorage (for admin users)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    
    // Prepare order data for backend
    const orderData = {
      items: (products as ProductCartItem[]).map((item: ProductCartItem) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: info.fullName,
        phone: info.phone,
        email: info.email,
        address: info.address,
        apartment: info.apartment,
        province: info.province,
        district: info.district,
        ward: info.ward,
        country: info.country || 'Vietnam',
        note: info.note,
      },
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod?.toUpperCase() || 'COD',
    };
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    
    const order = await response.json();
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 },
    );
  }
}
