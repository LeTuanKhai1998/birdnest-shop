import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@birdnest.com',
      },
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@1234', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@birdnest.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log('Admin user created successfully:');
    console.log('Email:', adminUser.email);
    console.log('Password: Admin@1234');
    console.log('Is Admin:', adminUser.isAdmin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 