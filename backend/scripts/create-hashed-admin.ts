import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createHashedAdmin() {
  try {
    // Hash password properly
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Delete existing admin user if exists
    await prisma.user.deleteMany({
      where: {
        email: 'admin@birdnest.com',
      },
    });

    // Create new admin user with hashed password
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@birdnest.com',
        name: 'Admin User',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log('✅ Admin user created successfully with hashed password:');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123');
    console.log('👑 Is Admin:', adminUser.isAdmin);
    console.log('🔒 Password is properly hashed and ready for login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createHashedAdmin(); 