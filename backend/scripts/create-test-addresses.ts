import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test addresses...');

  // Get the first user (assuming there's at least one user)
  const user = await prisma.user.findFirst({
    where: { isAdmin: false }
  });

  if (!user) {
    console.log('No user found. Please create a user first.');
    return;
  }

  console.log('Creating addresses for user:', user.email);

  // Create test addresses
  const addresses = await Promise.all([
    prisma.address.upsert({
      where: { 
        id: 'test-address-1' 
      },
      update: {},
      create: {
        id: 'test-address-1',
        userId: user.id,
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        province: '79', // Ho Chi Minh City
        district: '760', // District 1
        ward: '26734', // Ben Nghe Ward
        address: '123 Nguyễn Huệ',
        apartment: 'Apt 101',
        country: 'Vietnam',
        isDefault: true,
      },
    }),
    prisma.address.upsert({
      where: { 
        id: 'test-address-2' 
      },
      update: {},
      create: {
        id: 'test-address-2',
        userId: user.id,
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        province: '79', // Ho Chi Minh City
        district: '761', // District 3
        ward: '26767', // Vo Thi Sau Ward
        address: '456 Lê Lợi',
        apartment: 'Apt 202',
        country: 'Vietnam',
        isDefault: false,
      },
    }),
    prisma.address.upsert({
      where: { 
        id: 'test-address-3' 
      },
      update: {},
      create: {
        id: 'test-address-3',
        userId: user.id,
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        province: '79', // Ho Chi Minh City
        district: '762', // District 5
        ward: '26800', // Ward 1
        address: '789 Trần Phú',
        apartment: '',
        country: 'Vietnam',
        isDefault: false,
      },
    }),
  ]);

  console.log('Created addresses:', addresses.map(a => ({
    id: a.id,
    address: a.address,
    isDefault: a.isDefault
  })));

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