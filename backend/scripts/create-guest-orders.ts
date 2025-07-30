import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test guest orders...');

  // First, get some products to use in orders
  const products = await prisma.product.findMany({
    take: 3,
  });

  if (products.length === 0) {
    console.log('No products found. Please run create-test-data.ts first.');
    return;
  }

  // Create guest orders
  const guestOrders = [
    {
      guestName: 'Nguyen Van Guest',
      guestEmail: 'guest1@example.com',
      guestPhone: '0123456789',
      status: 'PENDING',
      total: '1500000',
      shippingAddress: 'Nguyen Van Guest, 0123456789, 123 Guest Street, Ho Chi Minh City',
      orderItems: [
        {
          productId: products[0].id,
          quantity: 1,
          price: '1500000',
        },
      ],
    },
    {
      guestName: 'Tran Thi Guest',
      guestEmail: 'guest2@example.com',
      guestPhone: '0987654321',
      status: 'PAID',
      total: '2800000',
      shippingAddress: 'Tran Thi Guest, 0987654321, 456 Guest Avenue, Hanoi',
      orderItems: [
        {
          productId: products[1].id,
          quantity: 1,
          price: '2800000',
        },
      ],
    },
    {
      guestName: 'Le Van Guest',
      guestEmail: 'guest3@example.com',
      guestPhone: '0555666777',
      status: 'SHIPPED',
      total: '1200000',
      shippingAddress: 'Le Van Guest, 0555666777, 789 Guest Road, Da Nang',
      orderItems: [
        {
          productId: products[2].id,
          quantity: 1,
          price: '1200000',
        },
      ],
    },
    {
      guestName: 'Pham Thi Guest',
      guestEmail: 'guest4@example.com',
      guestPhone: '0333444555',
      status: 'DELIVERED',
      total: '2000000',
      shippingAddress: 'Pham Thi Guest, 0333444555, 321 Guest Lane, Can Tho',
      orderItems: [
        {
          productId: products[0].id,
          quantity: 1,
          price: '2000000',
        },
      ],
    },
  ];

  for (const orderData of guestOrders) {
    try {
      const order = await prisma.order.create({
        data: {
          userId: undefined, // This makes it a guest order
          guestName: orderData.guestName,
          guestEmail: orderData.guestEmail,
          guestPhone: orderData.guestPhone,
          status: orderData.status as any,
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: 'COD',
          orderItems: {
            create: orderData.orderItems,
          },
        },
      });

      console.log(`Created guest order: ${order.id} for ${orderData.guestName}`);
    } catch (error) {
      console.error(`Error creating order for ${orderData.guestName}:`, error);
    }
  }

  console.log('Guest orders creation completed!');
  console.log('\nTest guest orders created:');
  console.log('1. guest1@example.com / 0123456789 - PENDING');
  console.log('2. guest2@example.com / 0987654321 - PAID');
  console.log('3. guest3@example.com / 0555666777 - SHIPPED');
  console.log('4. guest4@example.com / 0333444555 - DELIVERED');
  console.log('\nYou can now test the guest order tracking at /guest-orders');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 