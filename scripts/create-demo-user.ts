import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@demo.com';
  const password = 'Demo@1234';
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Demo user already exists.');
    return;
  }

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: 'Demo User',
      isAdmin: false,
    },
  });
  console.log('Demo user created:', email);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); 