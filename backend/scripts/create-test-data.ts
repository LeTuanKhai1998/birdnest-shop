import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating comprehensive test data...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'refined-nest' },
      update: {},
      create: {
        name: 'Refined Nest',
        slug: 'refined-nest',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'raw-nest' },
      update: {},
      create: {
        name: 'Raw Nest',
        slug: 'raw-nest',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'feather-removed' },
      update: {},
      create: {
        name: 'Feather-removed Nest',
        slug: 'feather-removed',
      },
    }),
  ]);

  console.log('Created categories:', categories.map(c => c.name));

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'premium-refined-nest-50g' },
      update: {},
      create: {
        name: 'Premium Refined Nest 50g',
        slug: 'premium-refined-nest-50g',
        description: 'High-quality refined bird\'s nest, carefully cleaned and processed. Perfect for daily consumption.',
        price: '1500000',
        quantity: 25,
        discount: 10,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'premium-refined-nest-100g' },
      update: {},
      create: {
        name: 'Premium Refined Nest 100g',
        slug: 'premium-refined-nest-100g',
        description: 'Premium refined bird\'s nest in larger quantity. Great value for families.',
        price: '2800000',
        quantity: 15,
        discount: 15,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'raw-nest-50g' },
      update: {},
      create: {
        name: 'Raw Bird\'s Nest 50g',
        slug: 'raw-nest-50g',
        description: 'Natural raw bird\'s nest, unprocessed and pure. For those who prefer natural products.',
        price: '1200000',
        quantity: 30,
        discount: 5,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'feather-removed-nest-100g' },
      update: {},
      create: {
        name: 'Feather-removed Nest 100g',
        slug: 'feather-removed-nest-100g',
        description: 'Bird\'s nest with feathers removed, semi-processed for convenience.',
        price: '2000000',
        quantity: 20,
        discount: 8,
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log('Created products:', products.map(p => p.name));

  // Create regular users
  const hashedPassword = await bcrypt.hash('User@1234', 12);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'customer1@example.com' },
      update: {},
      create: {
        email: 'customer1@example.com',
        name: 'Nguyen Van A',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer2@example.com' },
      update: {},
      create: {
        email: 'customer2@example.com',
        name: 'Tran Thi B',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
    prisma.user.upsert({
      where: { email: 'customer3@example.com' },
      update: {},
      create: {
        email: 'customer3@example.com',
        name: 'Le Van C',
        password: hashedPassword,
        isAdmin: false,
      },
    }),
  ]);

  console.log('Created users:', users.map(u => u.name));

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: 'DELIVERED',
        total: '1500000',
        shippingAddress: JSON.stringify({
          fullName: 'Nguyen Van A',
          phone: '0123456789',
          address: '123 Nguyen Trai Street',
          city: 'Ho Chi Minh City',
          state: 'Ho Chi Minh',
          zipCode: '70000',
          country: 'Vietnam',
          isDefault: true,
        }),
        orderItems: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: '1500000',
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        status: 'PAID',
        total: '2800000',
        shippingAddress: JSON.stringify({
          fullName: 'Tran Thi B',
          phone: '0987654321',
          address: '456 Le Loi Street',
          city: 'Hanoi',
          state: 'Hanoi',
          zipCode: '10000',
          country: 'Vietnam',
          isDefault: true,
        }),
        orderItems: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: '2800000',
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        status: 'PENDING',
        total: '1200000',
        shippingAddress: JSON.stringify({
          fullName: 'Le Van C',
          phone: '0555666777',
          address: '789 Tran Phu Street',
          city: 'Da Nang',
          state: 'Da Nang',
          zipCode: '50000',
          country: 'Vietnam',
          isDefault: true,
        }),
        orderItems: {
          create: [
            {
              productId: products[2].id,
              quantity: 1,
              price: '1200000',
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        userId: users[0].id,
        status: 'SHIPPED',
        total: '2000000',
        shippingAddress: JSON.stringify({
          fullName: 'Nguyen Van A',
          phone: '0123456789',
          address: '123 Nguyen Trai Street',
          city: 'Ho Chi Minh City',
          state: 'Ho Chi Minh',
          zipCode: '70000',
          country: 'Vietnam',
          isDefault: true,
        }),
        orderItems: {
          create: [
            {
              productId: products[3].id,
              quantity: 1,
              price: '2000000',
            },
          ],
        },
      },
    }),
  ]);

  console.log('Created orders:', orders.map(o => o.id));

  // Create notifications
  const notifications = [
    {
      title: 'Welcome to Birdnest Shop!',
      body: 'Thank you for joining us. Enjoy 10% off your first order with code WELCOME10.',
      type: 'PROMOTION' as any,
      recipientType: 'USER' as any,
      userId: users[0].id,
      isRead: false,
    },
    {
      title: 'Order Confirmed',
      body: 'Your order has been confirmed and is being processed.',
      type: 'ORDER' as any,
      recipientType: 'USER' as any,
      userId: users[1].id,
      isRead: false,
    },
    {
      title: 'Payment Successful',
      body: 'Payment for your order has been processed successfully.',
      type: 'PAYMENT' as any,
      recipientType: 'USER' as any,
      userId: users[0].id,
      isRead: true,
    },
    {
      title: 'New Product Available',
      body: 'Check out our latest premium bird\'s nest products!',
      type: 'PROMOTION' as any,
      recipientType: 'USER' as any,
      userId: users[2].id,
      isRead: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('Created notifications');

  console.log('Test data creation completed!');
  console.log('\nAdmin Login Credentials:');
  console.log('Email: admin@birdnest.com');
  console.log('Password: Admin@1234');
  console.log('\nCustomer Login Credentials:');
  console.log('Email: customer1@example.com (or customer2@example.com, customer3@example.com)');
  console.log('Password: User@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 