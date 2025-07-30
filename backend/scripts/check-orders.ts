import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking orders in database...');

  // Simple count
  const orderCount = await prisma.order.count();
  console.log(`Total orders: ${orderCount}`);

  // Get all orders with basic info
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      createdAt: true,
    },
    take: 10,
  });

  console.log(`\nFirst ${orders.length} orders:`);
  orders.forEach((order, index) => {
    console.log(`${index + 1}. Order ID: ${order.id}`);
    console.log(`   User ID: ${order.userId || 'Guest'}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: ${order.total}`);
    console.log(`   Created: ${order.createdAt}`);
    console.log('');
  });

  // Check users
  const userCount = await prisma.user.count();
  console.log(`Total users: ${userCount}`);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
    },
    take: 5,
  });

  console.log(`\nFirst ${users.length} users:`);
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email}) - Admin: ${user.isAdmin}`);
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