import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Update or create admin user with correct email
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@birdnest.vn' },
      update: {
        password: hashedPassword,
        isAdmin: true,
        name: 'Admin User',
      },
      create: {
        email: 'admin@birdnest.vn',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log('Admin user fixed successfully:');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Is Admin:', adminUser.isAdmin);
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser(); 