import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking admin user...');

  // Check for admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@birdnest.com' },
  });

  if (!adminUser) {
    console.log('Admin user not found');
    return;
  }

  console.log('Admin user found:');
  console.log('Email:', adminUser.email);
  console.log('Name:', adminUser.name);
  console.log('Is Admin:', adminUser.isAdmin);
  console.log('Password hash:', adminUser.password);

  // Test password verification
  const testPassword = 'Admin@1234';
  const isValid = await bcrypt.compare(testPassword, adminUser.password);
  console.log('Password "Admin@1234" is valid:', isValid);

  // Test with different password
  const testPassword2 = 'admin123';
  const isValid2 = await bcrypt.compare(testPassword2, adminUser.password);
  console.log('Password "admin123" is valid:', isValid2);

  // Check orders for this user
  const orders = await prisma.order.findMany({
    where: { userId: adminUser.id },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log('Orders for admin user:', orders.length);
  orders.forEach((order, index) => {
    console.log(`Order ${index + 1}:`, {
      id: order.id,
      status: order.status,
      total: order.total,
      items: order.orderItems.length,
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 