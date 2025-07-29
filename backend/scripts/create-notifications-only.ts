import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test notifications in cloud database...');

  // First, create or get a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'temp-password', // This will be hashed by the backend
      isAdmin: false,
    },
  });

  console.log('Test user:', testUser.email, 'ID:', testUser.id);

  // Create test notifications
  const notifications = [
    {
      title: 'Welcome to Birdnest Shop!',
      body: 'Thank you for joining us. Enjoy 10% off your first order with code WELCOME10.',
      type: 'PROMOTION' as any,
      recipientType: 'USER' as any,
      userId: testUser.id,
      isRead: false,
    },
    {
      title: 'Order #12345 Confirmed',
      body: 'Your order has been confirmed and is being processed.',
      type: 'ORDER' as any,
      recipientType: 'USER' as any,
      userId: testUser.id,
      isRead: false,
    },
    {
      title: 'Payment Successful',
      body: 'Payment for order #12345 has been processed successfully.',
      type: 'PAYMENT' as any,
      recipientType: 'USER' as any,
      userId: testUser.id,
      isRead: true,
    },
    {
      title: 'New Product Available',
      body: 'Check out our latest premium bird\'s nest products!',
      type: 'PROMOTION' as any,
      recipientType: 'USER' as any,
      userId: testUser.id,
      isRead: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }
  
  console.log('Created test notifications for user:', testUser.email);

  // Create an admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { isAdmin: true },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: 'temp-password',
      isAdmin: true,
    },
  });

  console.log('Admin user:', adminUser.email, 'ID:', adminUser.id, 'isAdmin:', adminUser.isAdmin);

  console.log('Test data creation completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 