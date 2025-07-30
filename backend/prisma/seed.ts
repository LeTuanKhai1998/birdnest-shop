import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const refinedCategory = await prisma.category.upsert({
    where: { slug: 'refined-nest' },
    update: {},
    create: {
      name: 'Refined Nest',
      slug: 'refined-nest',
    },
  });

  const rawCategory = await prisma.category.upsert({
    where: { slug: 'raw-nest' },
    update: {},
    create: {
      name: 'Raw Nest',
      slug: 'raw-nest',
    },
  });

  const featherRemovedCategory = await prisma.category.upsert({
    where: { slug: 'feather-removed-nest' },
    update: {},
    create: {
      name: 'Feather-removed Nest',
      slug: 'feather-removed-nest',
    },
  });

  console.log('✅ Categories created');

  // Create sample products
  const products = [
    {
      name: 'Premium Refined Bird\'s Nest 50g',
      slug: 'premium-refined-birds-nest-50g',
      description: 'High-quality refined bird\'s nest from Kien Giang, Vietnam. Carefully processed and cleaned for maximum purity.',
      price: 1500000, // 1.5M VND
      quantity: 100,
      weight: 50,
      categoryId: refinedCategory.id,
    },
    {
      name: 'Premium Refined Bird\'s Nest 100g',
      slug: 'premium-refined-birds-nest-100g',
      description: 'Premium refined bird\'s nest in 100g package. Perfect for regular consumption and health maintenance.',
      price: 2800000, // 2.8M VND
      quantity: 50,
      weight: 100,
      categoryId: refinedCategory.id,
    },
    {
      name: 'Premium Refined Bird\'s Nest 200g',
      slug: 'premium-refined-birds-nest-200g',
      description: 'Large package of refined bird\'s nest for family use. Economical choice for long-term consumption.',
      price: 5200000, // 5.2M VND
      quantity: 30,
      weight: 200,
      categoryId: refinedCategory.id,
    },
    {
      name: 'Raw Bird\'s Nest 50g',
      slug: 'raw-birds-nest-50g',
      description: 'Natural raw bird\'s nest from Kien Giang. Unprocessed and in its original form.',
      price: 3500000, // 3.5M VND
      quantity: 80,
      weight: 50,
      categoryId: rawCategory.id,
    },
    {
      name: 'Raw Bird\'s Nest 100g',
      slug: 'raw-birds-nest-100g',
      description: 'Raw bird\'s nest in 100g package. Natural and unprocessed for those who prefer original form.',
      price: 1500000, // 1.5M VND
      quantity: 60,
      weight: 100,
      categoryId: rawCategory.id,
    },
    {
      name: 'Feather-removed Bird\'s Nest 50g',
      slug: 'feather-removed-birds-nest-50g',
      description: 'Bird\'s nest with feathers removed but otherwise unprocessed. Clean and ready to use.',
      price: 2000000, // 2M VND
      quantity: 70,
      weight: 50,
      categoryId: featherRemovedCategory.id,
    },
    {
      name: 'Feather-removed Bird\'s Nest 100g',
      slug: 'feather-removed-birds-nest-100g',
      description: 'Feather-removed bird\'s nest in 100g package. Convenient size for regular use.',
      price: 2800000, // 2.8M VND
      quantity: 40,
      weight: 100,
      categoryId: featherRemovedCategory.id,
    },
    {
      name: 'Feather-removed Bird\'s Nest 200g',
      slug: 'feather-removed-birds-nest-200g',
      description: 'Large package of feather-removed bird\'s nest. Perfect for family consumption.',
      price: 1200000, // 1.2M VND
      quantity: 25,
      weight: 200,
      categoryId: featherRemovedCategory.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }

  console.log('✅ Products created');

  // Create a sample admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@birdnest.vn' },
    update: {},
    create: {
      email: 'admin@birdnest.vn',
      password: 'admin123', // In production, this should be hashed
      name: 'Admin User',
      phone: '0123456789',
      isAdmin: true,
    },
  });

  console.log('✅ Admin user created');

  // Create sample users
  const users = [
    {
      email: 'nguyen.anh@example.com',
      password: 'password123',
      name: 'Nguyễn Thị Anh',
      phone: '0123456781',
    },
    {
      email: 'tran.binh@example.com',
      password: 'password123',
      name: 'Trần Văn Bình',
      phone: '0123456782',
    },
    {
      email: 'le.cam@example.com',
      password: 'password123',
      name: 'Lê Thị Cẩm',
      phone: '0123456783',
    },
    {
      email: 'pham.dung@example.com',
      password: 'password123',
      name: 'Phạm Văn Dũng',
      phone: '0123456784',
    },
    {
      email: 'hoang.em@example.com',
      password: 'password123',
      name: 'Hoàng Thị Em',
      phone: '0123456785',
    },
  ];

  const createdUsers: any[] = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    createdUsers.push(user);
  }

  console.log('✅ Sample users created');

  // Create sample reviews
  const reviews = [
    {
      userId: createdUsers[0].id,
      productId: (await prisma.product.findUnique({ where: { slug: 'premium-refined-birds-nest-100g' } }))!.id,
      rating: 5,
      comment: 'Yến sào chất lượng rất tốt, đóng gói cẩn thận. Giao hàng nhanh và nhân viên phục vụ nhiệt tình. Sẽ mua lại!',
    },
    {
      userId: createdUsers[1].id,
      productId: (await prisma.product.findUnique({ where: { slug: 'raw-birds-nest-100g' } }))!.id,
      rating: 5,
      comment: 'Sản phẩm đúng như mô tả, yến sào nguyên chất từ Kiên Giang. Chế biến dễ dàng và hương vị thơm ngon.',
    },
    {
      userId: createdUsers[2].id,
      productId: (await prisma.product.findUnique({ where: { slug: 'feather-removed-birds-nest-100g' } }))!.id,
      rating: 5,
      comment: 'Mua làm quà tặng cho mẹ, bà rất thích. Chất lượng tốt và giá cả hợp lý. Cảm ơn shop!',
    },
    {
      userId: createdUsers[3].id,
      productId: (await prisma.product.findUnique({ where: { slug: 'feather-removed-birds-nest-100g' } }))!.id,
      rating: 5,
      comment: 'Yến sào rút lông rất sạch, không có tạp chất. Chế biến đơn giản và ngon. Đã mua lần thứ 3 rồi!',
    },
    {
      userId: createdUsers[4].id,
      productId: (await prisma.product.findUnique({ where: { slug: 'premium-refined-birds-nest-50g' } }))!.id,
      rating: 5,
      comment: 'Giao hàng nhanh, đóng gói đẹp. Yến sào chất lượng cao, đúng như quảng cáo. Rất hài lòng!',
    },
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData,
    });
  }

  console.log('✅ Sample reviews created');

  console.log('🎉 Database seeding completed!');
  console.log('📊 Summary:');
  console.log(`   - Categories: 3`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Admin user: ${adminUser.email}`);
  console.log(`   - Sample users: ${createdUsers.length}`);
  console.log(`   - Sample reviews: ${reviews.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 