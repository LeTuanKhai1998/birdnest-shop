import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding test addresses...');

  // Find any user
  const users = await prisma.user.findMany({
    take: 1
  });

  if (users.length === 0) {
    console.log('No users found. Please create a user first.');
    return;
  }

  const user = users[0];
  console.log('Adding addresses for user:', user.email);

  // Create addresses
  const addresses = [
    {
      userId: user.id,
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      province: '79',
      district: '760',
      ward: '26734',
      address: '123 Nguyễn Huệ',
      apartment: 'Apt 101',
      country: 'Vietnam',
      isDefault: true,
    },
    {
      userId: user.id,
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      province: '79',
      district: '761',
      ward: '26767',
      address: '456 Lê Lợi',
      apartment: 'Apt 202',
      country: 'Vietnam',
      isDefault: false,
    }
  ];

  for (const addressData of addresses) {
    const address = await prisma.address.create({
      data: addressData
    });
    console.log('Created address:', address.id, address.address);
  }

  console.log('Test addresses created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 