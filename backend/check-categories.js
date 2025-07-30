const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking all categories in database...');
  
  const categories = await prisma.category.findMany();
  console.log(`Found ${categories.length} categories:`);
  
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (ID: ${cat.id})`);
  });
  
  // Also check products and their categories
  console.log('\n📦 Products and their categories:');
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} -> Category: ${product.category.name}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 