import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing cloud database connection...');

  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test user query
    const users = await prisma.user.findMany({
      take: 5,
    });
    console.log('✅ Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });

    // Test notifications query
    const notifications = await prisma.notification.findMany({
      take: 5,
    });
    console.log('✅ Notifications found:', notifications.length);
    notifications.forEach(notification => {
      console.log(`  - ${notification.title} (${notification.id})`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 