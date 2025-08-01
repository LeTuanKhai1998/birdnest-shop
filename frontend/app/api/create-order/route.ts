import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

type OrderItem = {
  productId: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  console.log('Received order data:', JSON.stringify(body, null, 2));
  
  const { items, shippingAddress, deliveryFee, paymentMethod } = body;
  console.log('Extracted data:', { 
    hasItems: !!items, 
    itemsLength: items?.length, 
    hasShippingAddress: !!shippingAddress,
    deliveryFee,
    paymentMethod
  });
  
  if (!items || !items.length || !shippingAddress) {
    console.log('Validation failed:', { items, shippingAddress });
    return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
  }

  // Validate that all product IDs exist in the backend
  try {
    const productIds = items.map((item: any) => item.productId);
    console.log('Validating product IDs:', productIds);
    
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products for validation');
    }
    
    const availableProducts = await productsResponse.json();
    const availableProductIds = availableProducts.map((p: any) => p.id);
    
    const invalidProductIds = productIds.filter((id: string) => !availableProductIds.includes(id));
    if (invalidProductIds.length > 0) {
      console.log('Invalid product IDs found:', invalidProductIds);
      return NextResponse.json({ 
        error: `Products not found: ${invalidProductIds.join(', ')}. Please refresh your cart.` 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error validating products:', error);
    return NextResponse.json({ 
      error: 'Failed to validate products. Please try again.' 
    }, { status: 500 });
  }

  try {
    // Prepare order data for backend
    console.log('Items being sent to backend:', items);
    const orderData = {
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        address: shippingAddress.address,
        apartment: shippingAddress.apartment,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'Vietnam',
        note: shippingAddress.note,
      },
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod?.toUpperCase() || 'COD',
    };
    
    // Use JWT authentication with the backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add JWT token from session
    if (session.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers,
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
