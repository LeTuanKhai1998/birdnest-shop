import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSimpleAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@birdnest.com',
      },
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Email: admin@birdnest.com');
      console.log('Password: admin123');
      console.log('Is Admin:', existingAdmin.isAdmin);
      return;
    }

    // Create admin user with plain password (will be hashed by the backend)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@birdnest.com',
        name: 'Admin User',
        password: 'admin123', // This will be hashed by the backend auth system
        isAdmin: true,
      },
    });

    console.log('Admin user created successfully:');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Is Admin:', adminUser.isAdmin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleAdmin(); 