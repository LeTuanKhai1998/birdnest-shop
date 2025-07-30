import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test orders for admin user...');

  // Get the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@birdnest.com' },
  });

  if (!adminUser) {
    console.log('Admin user not found. Creating one...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin@1234', 12);
    
    const newAdminUser = await prisma.user.create({
      data: {
        email: 'admin@birdnest.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });
    console.log('Created admin user:', newAdminUser.email);
  }

  const user = adminUser || await prisma.user.findUnique({
    where: { email: 'admin@birdnest.com' },
  });

  if (!user) {
    console.error('Could not find or create admin user');
    return;
  }

  // Get some products
  const products = await prisma.product.findMany({
    take: 3,
  });

  if (products.length === 0) {
    console.error('No products found. Please run the seed script first.');
    return;
  }

  // Create orders for the admin user
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: user.id,
        status: 'DELIVERED',
        total: '1500000',
        paymentMethod: 'COD',
        shippingAddress: 'Admin User, 0123456789, 123 Admin Street, Ho Chi Minh City, Vietnam',
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
        userId: user.id,
        status: 'SHIPPED',
        total: '2800000',
        paymentMethod: 'STRIPE',
        shippingAddress: 'Admin User, 0123456789, 123 Admin Street, Ho Chi Minh City, Vietnam',
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
        userId: user.id,
        status: 'PENDING',
        total: '2000000',
        paymentMethod: 'MOMO',
        shippingAddress: 'Admin User, 0123456789, 123 Admin Street, Ho Chi Minh City, Vietnam',
        orderItems: {
          create: [
            {
              productId: products[2].id,
              quantity: 1,
              price: '2000000',
            },
          ],
        },
      },
    }),
  ]);

  console.log('Created orders for admin user:', orders.map(o => o.id));
  console.log('Admin user email:', user.email);
  console.log('Admin user password: Admin@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 