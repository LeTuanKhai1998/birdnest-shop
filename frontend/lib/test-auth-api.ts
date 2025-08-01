import { api } from './api-with-auth';

/**
 * Sample API request to test JWT authentication
 * This function demonstrates how to use the authenticated API utility
 */
export async function testAuthenticatedAPI() {
  try {
    // Test getting user profile
    const profileResponse = await api.get('/users/profile');
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      console.log('✅ User profile retrieved successfully:', profile);
      return { success: true, data: profile };
    } else {
      console.error('❌ Failed to get user profile:', profileResponse.status);
      return { success: false, error: 'Failed to get user profile' };
    }
  } catch (error) {
    console.error('❌ API test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test creating an order with JWT authentication
 */
export async function testCreateOrder() {
  try {
    const orderData = {
      items: [
        {
          productId: 'test-product-id',
          quantity: 1,
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Vietnam',
      },
      deliveryFee: 0,
      paymentMethod: 'COD',
    };

    const response = await api.post('/orders', orderData);
    
    if (response.ok) {
      const order = await response.json();
      console.log('✅ Order created successfully:', order);
      return { success: true, data: order };
    } else {
      const error = await response.json();
      console.error('❌ Failed to create order:', error);
      return { success: false, error: error.message || 'Failed to create order' };
    }
  } catch (error) {
    console.error('❌ Create order error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test getting user addresses with JWT authentication
 */
export async function testGetAddresses() {
  try {
    const response = await api.get('/addresses');
    
    if (response.ok) {
      const addresses = await response.json();
      console.log('✅ Addresses retrieved successfully:', addresses);
      return { success: true, data: addresses };
    } else {
      console.error('❌ Failed to get addresses:', response.status);
      return { success: false, error: 'Failed to get addresses' };
    }
  } catch (error) {
    console.error('❌ Get addresses error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 