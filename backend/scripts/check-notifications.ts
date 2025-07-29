import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking notifications...');

  // Get all notifications
  const notifications = await prisma.notification.findMany({
    include: {
      user: true,
    },
  });

  console.log('Total notifications:', notifications.length);
  
  notifications.forEach((notification, index) => {
    console.log(`\nNotification ${index + 1}:`);
    console.log('  ID:', notification.id);
    console.log('  Title:', notification.title);
    console.log('  Type:', notification.type);
    console.log('  Recipient Type:', notification.recipientType);
    console.log('  User ID:', notification.userId);
    console.log('  Is Read:', notification.isRead);
    console.log('  User Email:', notification.user?.email);
  });

  // Get the test user
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  console.log('\nTest user:', testUser?.email, 'ID:', testUser?.id);

  // Get notifications for the test user
  const userNotifications = await prisma.notification.findMany({
    where: { userId: testUser?.id },
  });

  console.log('Notifications for test user:', userNotifications.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 