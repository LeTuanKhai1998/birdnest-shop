import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    console.log('Available products in database:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Price: ${product.price}`);
      console.log('---');
    });

    console.log(`Total products: ${products.length}`);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts(); 