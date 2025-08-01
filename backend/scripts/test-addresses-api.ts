import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing addresses API...');

  // Get a user
  const user = await prisma.user.findFirst({
    where: { isAdmin: false }
  });

  if (!user) {
    console.log('No user found');
    return;
  }

  console.log('User:', user.email);

  // Get addresses for this user
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  console.log('Addresses from database:', addresses.map(a => ({
    id: a.id,
    fullName: a.fullName,
    isDefault: a.isDefault,
    address: a.address
  })));

  const defaultAddress = addresses.find(a => a.isDefault);
  console.log('Default address:', defaultAddress);

  // Test the service method directly
  const AddressesService = require('../src/addresses/addresses.service').AddressesService;
  const service = new AddressesService(prisma);
  
  const serviceAddresses = await service.findAll(user.id);
  console.log('Addresses from service:', serviceAddresses.map(a => ({
    id: a.id,
    fullName: a.fullName,
    isDefault: a.isDefault,
    address: a.address
  })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 