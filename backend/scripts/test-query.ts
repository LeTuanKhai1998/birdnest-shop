import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'cmdohcs140000ryhm06jpr39f';
  const isAdmin = false;

  console.log('Testing query for user:', userId, 'isAdmin:', isAdmin);

  const where: any = {
    OR: [
      { userId: userId },
      { 
        userId: null, 
        recipientType: 'USER' as any
      },
    ],
  };

  console.log('Query where clause:', JSON.stringify(where, null, 2));

  const result = await prisma.notification.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('Found notifications:', result.length);
  console.log('Result:', JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 