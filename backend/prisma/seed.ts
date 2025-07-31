import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const rawCategory = await prisma.category.upsert({
    where: { slug: 'raw-nest' },
    update: {},
    create: {
      name: 'Yến thô',
      slug: 'raw-nest',
    },
  });

  const refinedCategory = await prisma.category.upsert({
    where: { slug: 'refined-nest' },
    update: {},
    create: {
      name: 'Yến tinh chế',
      slug: 'refined-nest',
    },
  });

  const bottledCategory = await prisma.category.upsert({
    where: { slug: 'bottled-nest' },
    update: {},
    create: {
      name: 'Yến hũ',
      slug: 'bottled-nest',
    },
  });

  const babyCategory = await prisma.category.upsert({
    where: { slug: 'baby-nest' },
    update: {},
    create: {
      name: 'Yến baby',
      slug: 'baby-nest',
    },
  });

  console.log('✅ Categories created');

  // Products sample (you can assign categoryId from above as needed)
  const products = [
    {
      name: 'Yến tinh chế cao cấp 50g',
      slug: 'premium-refined-birds-nest-50g',
      description: 'Yến tinh chế chất lượng cao từ Kiên Giang, đã làm sạch kỹ lưỡng.',
      price: 1500000,
      quantity: 100,
      weight: 50,
      categoryId: refinedCategory.id,
    },
    {
      name: 'Yến tinh chế cao cấp 100g',
      slug: 'premium-refined-birds-nest-100g',
      description: 'Gói 100g yến tinh chế, tiện lợi cho việc sử dụng thường xuyên.',
      price: 2800000,
      quantity: 50,
      weight: 100,
      categoryId: refinedCategory.id,
    },
    {
      name: 'Yến thô nguyên tổ 100g',
      slug: 'raw-birds-nest-100g',
      description: 'Yến nguyên tổ chưa qua sơ chế, giữ nguyên hương vị tự nhiên.',
      price: 1500000,
      quantity: 60,
      weight: 100,
      categoryId: rawCategory.id,
    },
    {
      name: 'Yến hũ dinh dưỡng 70ml x6',
      slug: 'bottled-nest-6pack',
      description: 'Combo 6 hũ yến chưng sẵn tiện dụng, thích hợp làm quà tặng.',
      price: 600000,
      quantity: 40,
      weight: 420,
      categoryId: bottledCategory.id,
    },
    {
      name: 'Yến baby bổ sung DHA 70ml',
      slug: 'baby-nest-dha-70ml',
      description: 'Yến chưng dành cho trẻ em, bổ sung DHA và canxi giúp phát triển trí não.',
      price: 120000,
      quantity: 80,
      weight: 70,
      categoryId: babyCategory.id,
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

  // Create admin with hashed password
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@birdnest.vn' },
    update: {},
    create: {
      email: 'admin@birdnest.vn',
      password: hashedAdminPassword,
      name: 'Admin User',
      phone: '0123456789',
      isAdmin: true,
    },
  });

  console.log('✅ Admin user created');

  // Sample users with hashed passwords
  const usersData = [
    { email: 'user1@gmail.com', password: 'user123', name: 'Nguyễn Thị Anh', phone: '0123456781' },
    { email: 'user2@gmail.com', password: 'user123', name: 'Trần Văn Bình', phone: '0123456782' },
    { email: 'user3@gmail.com', password: 'user123', name: 'Lê Thị Cẩm', phone: '0123456783' },
    { email: 'user4@gmail.com', password: 'user123', name: 'Phạm Văn Dũng', phone: '0123456784' },
    { email: 'user5@gmail.com', password: 'user123', name: 'Hoàng Thị Em', phone: '0123456785' },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        password: hashedPassword,
      },
    });
    createdUsers.push(user);
  }

  console.log('✅ Sample users created');

  // Reviews
  console.log('📝 Creating reviews...');
  
  // Get products for reviews
  const product1 = await prisma.product.findUnique({ where: { slug: 'premium-refined-birds-nest-100g' } });
  const product2 = await prisma.product.findUnique({ where: { slug: 'raw-birds-nest-100g' } });
  const product3 = await prisma.product.findUnique({ where: { slug: 'bottled-nest-6pack' } });

  if (!product1 || !product2 || !product3) {
    console.log('⚠️ Some products not found for reviews, skipping...');
  } else {
    const reviews = [
      {
        userId: createdUsers[0].id,
        productId: product1.id,
        rating: 5,
        comment: 'Yến chất lượng tuyệt vời, sẽ quay lại mua tiếp.',
      },
      {
        userId: createdUsers[1].id,
        productId: product2.id,
        rating: 5,
        comment: 'Sản phẩm đúng mô tả, thơm ngon và bổ dưỡng.',
      },
      {
        userId: createdUsers[2].id,
        productId: product3.id,
        rating: 5,
        comment: 'Tặng mẹ và bà đều rất hài lòng!',
      },
    ];

    for (const review of reviews) {
      await prisma.review.create({ data: review });
    }
  }

  console.log('✅ Sample reviews created');
  console.log('🎉 Seeding done!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
