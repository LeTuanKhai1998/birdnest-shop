import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Yến tinh chế', slug: 'yen-tinh-che' },
      { name: 'Yến rút lông', slug: 'yen-rut-long' },
      { name: 'Tổ yến thô', slug: 'to-yen-tho' },
    ],
    skipDuplicates: true,
  });

  // Get categories with IDs
  const yenTinhChe = await prisma.category.findUnique({ where: { slug: 'yen-tinh-che' } });
  const yenRutLong = await prisma.category.findUnique({ where: { slug: 'yen-rut-long' } });
  const toYenTho = await prisma.category.findUnique({ where: { slug: 'to-yen-tho' } });

  // Seed products
  await prisma.product.createMany({
    data: [
      // Yến tinh chế
      {
        id: 'db1',
        name: 'Yến tinh chế Khánh Hòa 50g',
        slug: 'yen-tinh-che-khanh-hoa-50g',
        description: 'Yến tinh chế Khánh Hòa, nguồn gốc tự nhiên, tốt cho sức khỏe, trọng lượng 50g.',
        price: 3500000,
        discount: 0,
        quantity: 20,
        images: ['/images/p1.png'],
        categoryId: yenTinhChe?.id || '',
      },
      {
        id: 'db2',
        name: 'Yến tinh chế Cần Giờ 100g',
        slug: 'yen-tinh-che-can-gio-100g',
        description: 'Yến tinh chế Cần Giờ, bổ dưỡng, tăng cường sức đề kháng, trọng lượng 100g.',
        price: 6500000,
        discount: 0,
        quantity: 10,
        images: ['/images/p2.png'],
        categoryId: yenTinhChe?.id || '',
      },
      {
        id: 'db3',
        name: 'Yến tinh chế Kiên Giang 200g',
        slug: 'yen-tinh-che-kien-giang-200g',
        description: 'Yến tinh chế Kiên Giang, chất lượng cao, trọng lượng 200g.',
        price: 12000000,
        discount: 0,
        quantity: 5,
        images: ['/images/p3.png'],
        categoryId: yenTinhChe?.id || '',
      },
      {
        id: 'db4',
        name: 'Yến tinh chế Sóc Trăng 50g',
        slug: 'yen-tinh-che-soc-trang-50g',
        description: 'Yến tinh chế Sóc Trăng, thơm ngon, bổ dưỡng, trọng lượng 50g.',
        price: 3400000,
        discount: 0,
        quantity: 12,
        images: ['/images/p1.png'],
        categoryId: yenTinhChe?.id || '',
      },
      // Yến rút lông
      {
        id: 'db5',
        name: 'Yến rút lông Nha Trang 50g',
        slug: 'yen-rut-long-nha-trang-50g',
        description: 'Yến rút lông Nha Trang, sạch lông, giữ nguyên dưỡng chất, trọng lượng 50g.',
        price: 4000000,
        discount: 0,
        quantity: 15,
        images: ['/images/p3.png'],
        categoryId: yenRutLong?.id || '',
      },
      {
        id: 'db6',
        name: 'Yến rút lông Phan Rang 100g',
        slug: 'yen-rut-long-phan-rang-100g',
        description: 'Yến rút lông Phan Rang, giàu dinh dưỡng, tốt cho sức khỏe, trọng lượng 100g.',
        price: 7500000,
        discount: 0,
        quantity: 8,
        images: ['/images/p1.png'],
        categoryId: yenRutLong?.id || '',
      },
      {
        id: 'db7',
        name: 'Yến rút lông Cần Giờ 200g',
        slug: 'yen-rut-long-can-gio-200g',
        description: 'Yến rút lông Cần Giờ, chất lượng cao, trọng lượng 200g.',
        price: 14000000,
        discount: 0,
        quantity: 3,
        images: ['/images/p2.png'],
        categoryId: yenRutLong?.id || '',
      },
      {
        id: 'db8',
        name: 'Yến rút lông Bình Định 50g',
        slug: 'yen-rut-long-binh-dinh-50g',
        description: 'Yến rút lông Bình Định, thơm ngon, bổ dưỡng, trọng lượng 50g.',
        price: 4100000,
        discount: 0,
        quantity: 10,
        images: ['/images/p3.png'],
        categoryId: yenRutLong?.id || '',
      },
      // Tổ yến thô
      {
        id: 'db9',
        name: 'Tổ yến thô Bình Định 50g',
        slug: 'to-yen-tho-binh-dinh-50g',
        description: 'Tổ yến thô Bình Định, nguyên chất, chưa qua chế biến, trọng lượng 50g.',
        price: 3000000,
        discount: 0,
        quantity: 25,
        images: ['/images/p2.png'],
        categoryId: toYenTho?.id || '',
      },
      {
        id: 'db10',
        name: 'Tổ yến thô Quảng Nam 100g',
        slug: 'to-yen-tho-quang-nam-100g',
        description: 'Tổ yến thô Quảng Nam, tự nhiên, giàu dưỡng chất, trọng lượng 100g.',
        price: 6000000,
        discount: 0,
        quantity: 12,
        images: ['/images/p3.png'],
        categoryId: toYenTho?.id || '',
      },
      {
        id: 'db11',
        name: 'Tổ yến thô Kiên Giang 200g',
        slug: 'to-yen-tho-kien-giang-200g',
        description: 'Tổ yến thô Kiên Giang, chất lượng cao, trọng lượng 200g.',
        price: 11000000,
        discount: 0,
        quantity: 6,
        images: ['/images/p1.png'],
        categoryId: toYenTho?.id || '',
      },
      {
        id: 'db12',
        name: 'Tổ yến thô Cần Giờ 50g',
        slug: 'to-yen-tho-can-gio-50g',
        description: 'Tổ yến thô Cần Giờ, thơm ngon, bổ dưỡng, trọng lượng 50g.',
        price: 3200000,
        discount: 0,
        quantity: 18,
        images: ['/images/p2.png'],
        categoryId: toYenTho?.id || '',
      },
    ],
    skipDuplicates: true,
  });

  // Seed users (hash passwords)
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  await prisma.user.createMany({
    data: [
      // Admins
      {
        email: 'admin1@birdnest.vn',
        password: adminPassword,
        name: 'Nguyễn Văn Quang',
        phone: '0909123456',
        address: '123 Lê Lợi, Quận 1, TP.HCM',
        isAdmin: true,
      },
      {
        email: 'admin2@birdnest.vn',
        password: adminPassword,
        name: 'Trần Thị Mai',
        phone: '0909234567',
        address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
        isAdmin: true,
      },
      // Regular users
      {
        email: 'user1@birdnest.vn',
        password: userPassword,
        name: 'Lê Minh Tuấn',
        phone: '0911123456',
        address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
        isAdmin: false,
      },
      {
        email: 'user2@birdnest.vn',
        password: userPassword,
        name: 'Phạm Thị Hồng',
        phone: '0911223456',
        address: '321 Võ Văn Kiệt, Quận 6, TP.HCM',
        isAdmin: false,
      },
      {
        email: 'user3@birdnest.vn',
        password: userPassword,
        name: 'Võ Quốc Bảo',
        phone: '0911333456',
        address: '654 Nguyễn Trãi, Quận 1, TP.HCM',
        isAdmin: false,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 