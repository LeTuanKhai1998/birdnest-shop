import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating category names to match Vietnamese filter values...');

  // Update categories to match the filter values
  const updates = await Promise.all([
    prisma.category.updateMany({
      where: { name: 'Refined Nest' },
      data: { name: 'Yến tinh chế' }
    }),
    prisma.category.updateMany({
      where: { name: 'Raw Nest' },
      data: { name: 'Tổ yến thô' }
    }),
    prisma.category.updateMany({
      where: { name: 'Feather-removed Nest' },
      data: { name: 'Yến rút lông' }
    })
  ]);

  console.log('✅ Categories updated successfully');
  console.log('Updated categories:');
  
  const categories = await prisma.category.findMany();
  categories.forEach(cat => {
    console.log(`- ${cat.name} (${cat.slug})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error updating categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 