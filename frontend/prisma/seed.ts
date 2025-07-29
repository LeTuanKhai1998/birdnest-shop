import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@birdnest.com' },
    update: {},
    create: {
      email: 'admin@birdnest.com',
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);
  // Create categories
  const refinedCategory = await prisma.category.upsert({
    where: { name: 'Refined Nest' },
    update: {},
    create: {
      name: 'Refined Nest',
      slug: 'refined-nest',
    },
  });

  const rawCategory = await prisma.category.upsert({
    where: { name: 'Raw Nest' },
    update: {},
    create: {
      name: 'Raw Nest',
      slug: 'raw-nest',
    },
  });

  const featherRemovedCategory = await prisma.category.upsert({
    where: { name: 'Feather-removed Nest' },
    update: {},
    create: {
      name: 'Feather-removed Nest',
      slug: 'feather-removed-nest',
    },
  });

  const comboCategory = await prisma.category.upsert({
    where: { name: 'Combo' },
    update: {},
    create: {
      name: 'Combo',
      slug: 'combo',
    },
  });

  // Create products
  const products = [
    {
      name: 'Premium Refined Birdnest 50g',
      slug: 'premium-refined-birdnest-50g',
      description:
        'High-quality refined birdnest, carefully processed and cleaned. Perfect for daily consumption.',
      price: 1500000,
      quantity: 50,
      categoryId: refinedCategory.id,
      images: [
        { url: '/images/banner1.png', isPrimary: true },
        { url: '/images/banner2.png', isPrimary: false },
      ],
    },
    {
      name: 'Raw Birdnest 100g',
      slug: 'raw-birdnest-100g',
      description:
        'Natural raw birdnest from Kien Giang, preserved in its original state.',
      price: 2800000,
      quantity: 30,
      categoryId: rawCategory.id,
      images: [
        { url: '/images/banner3.png', isPrimary: true },
        { url: '/images/banner1.png', isPrimary: false },
      ],
    },
    {
      name: 'Feather-removed Birdnest 200g',
      slug: 'feather-removed-birdnest-200g',
      description:
        'Carefully processed birdnest with feathers removed, ready for cooking.',
      price: 5200000,
      quantity: 20,
      categoryId: featherRemovedCategory.id,
      images: [
        { url: '/images/banner2.png', isPrimary: true },
        { url: '/images/banner3.png', isPrimary: false },
      ],
    },
    {
      name: 'Premium Gift Combo Set',
      slug: 'premium-gift-combo-set',
      description:
        'Luxury gift combo including refined birdnest, honey, and premium packaging.',
      price: 3500000,
      quantity: 15,
      categoryId: comboCategory.id,
      images: [
        { url: '/images/banner1.png', isPrimary: true },
        { url: '/images/banner2.png', isPrimary: false },
      ],
    },
    {
      name: 'Family Pack Combo',
      slug: 'family-pack-combo',
      description:
        'Perfect for family consumption with multiple birdnest varieties.',
      price: 4500000,
      quantity: 25,
      categoryId: comboCategory.id,
      images: [
        { url: '/images/banner3.png', isPrimary: true },
        { url: '/images/banner1.png', isPrimary: false },
      ],
    },
  ];

  for (const productData of products) {
    const { images, ...productInfo } = productData;

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productInfo,
        images: {
          create: images,
        },
      },
    });

    console.log(`Created product: ${product.name}`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
