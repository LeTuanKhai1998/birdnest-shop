import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking addresses in database...');

  const addresses = await prisma.address.findMany({
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  });

  console.log('All addresses:', addresses.map(a => ({
    id: a.id,
    fullName: a.fullName,
    isDefault: a.isDefault,
    userId: a.userId,
    userEmail: a.user.email
  })));

  const defaultAddresses = addresses.filter(a => a.isDefault);
  console.log('Default addresses:', defaultAddresses.map(a => ({
    id: a.id,
    fullName: a.fullName,
    isDefault: a.isDefault
  })));

  console.log('Total addresses:', addresses.length);
  console.log('Default addresses count:', defaultAddresses.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 