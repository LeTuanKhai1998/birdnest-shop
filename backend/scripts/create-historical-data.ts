import { PrismaClient, OrderStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Function to generate readable ID
function generateReadableId(prefix: string, index: number): string {
  const year = new Date().getFullYear();
  const paddedIndex = index.toString().padStart(3, '0');
  return `${prefix}-${year}-${paddedIndex}`;
}

// Function to get random date within last 6 months
function getRandomDate(startDate: Date, endDate: Date): Date {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

// Vietnamese names for realistic data
const vietnameseNames = [
  'Nguyễn Thị Anh', 'Trần Văn Bình', 'Lê Thị Cẩm', 'Phạm Văn Dũng', 'Hoàng Thị Em',
  'Vũ Văn Phúc', 'Đặng Thị Giang', 'Bùi Văn Hùng', 'Đỗ Thị Hương', 'Hồ Văn Khoa',
  'Ngô Thị Lan', 'Lý Văn Minh', 'Trịnh Thị Nga', 'Đinh Văn Phương', 'Tô Thị Quỳnh',
  'Võ Văn Sơn', 'Đoàn Thị Thanh', 'Lưu Văn Tuấn', 'Hà Thị Uyên', 'Mai Văn Việt',
  'Lâm Thị Xuân', 'Tạ Văn Yến', 'Châu Thị Ánh', 'Hồng Văn Bảo', 'Thảo Thị Cát',
  'Khang Văn Đức', 'Linh Thị Hà', 'Nam Văn Huy', 'Oanh Thị Kim', 'Phúc Văn Long'
];

// Vietnamese addresses
const vietnameseAddresses = [
  '123 Nguyễn Huệ, Quận 1, TP.HCM',
  '456 Lê Lợi, Quận 3, TP.HCM',
  '789 Trần Hưng Đạo, Quận 5, TP.HCM',
  '321 Võ Văn Tần, Quận 3, TP.HCM',
  '654 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
  '987 Cách Mạng Tháng 8, Quận 10, TP.HCM',
  '147 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
  '258 Lý Tự Trọng, Quận 1, TP.HCM',
  '369 Đồng Khởi, Quận 1, TP.HCM',
  '741 Pasteur, Quận 1, TP.HCM',
  '852 Hai Bà Trưng, Quận 1, TP.HCM',
  '963 Đồng Nai, Quận 1, TP.HCM',
  '159 Nguyễn Du, Quận 1, TP.HCM',
  '753 Lý Chính Thắng, Quận 3, TP.HCM',
  '951 Võ Thị Sáu, Quận 3, TP.HCM'
];

// Realistic review comments
const reviewComments = [
  'Sản phẩm chất lượng tuyệt vời, đóng gói cẩn thận. Sẽ quay lại mua tiếp!',
  'Yến thơm ngon, đúng như mô tả. Giao hàng nhanh, nhân viên thân thiện.',
  'Tặng mẹ và bà đều rất hài lòng. Chất lượng cao, giá cả hợp lý.',
  'Đã mua nhiều lần, luôn hài lòng về chất lượng và dịch vụ.',
  'Yến tinh chế rất ngon, phù hợp cho người già và trẻ em.',
  'Giao hàng đúng hẹn, sản phẩm tươi mới. Cảm ơn shop!',
  'Chất lượng vượt mong đợi, sẽ giới thiệu cho bạn bè.',
  'Đóng gói đẹp, thích hợp làm quà tặng. Rất hài lòng!',
  'Yến baby con mình rất thích, uống đều đặn mỗi ngày.',
  'Sản phẩm chính hãng, an toàn cho sức khỏe. Cảm ơn shop!',
  'Giao hàng nhanh chóng, nhân viên nhiệt tình. Sẽ mua lại!',
  'Yến hũ tiện lợi, thích hợp cho người bận rộn.',
  'Chất lượng cao cấp, đáng đồng tiền bát gạo.',
  'Đã sử dụng được 2 tháng, thấy hiệu quả rõ rệt.',
  'Sản phẩm tốt, dịch vụ tốt, giá cả phải chăng.',
  'Yến thô nguyên tổ rất ngon, giữ nguyên hương vị tự nhiên.',
  'Đóng gói cẩn thận, không bị vỡ. Rất hài lòng!',
  'Giao hàng đúng giờ, sản phẩm chất lượng. Cảm ơn!',
  'Yến tinh chế cao cấp, thích hợp cho người già.',
  'Sản phẩm đúng mô tả, giá cả hợp lý. Sẽ mua lại!'
];

async function main() {
  console.log('🌱 Creating comprehensive historical data...');

  // Get existing products and categories
  const products = await prisma.product.findMany();
  const categories = await prisma.category.findMany();

  if (products.length === 0) {
    console.log('❌ No products found. Please run seed.ts first.');
    return;
  }

  console.log(`📦 Found ${products.length} products`);
  console.log(`📂 Found ${categories.length} categories`);

  // Create additional users (20 more users)
  console.log('👥 Creating additional users...');
  const additionalUsers: any[] = [];
  
  // Get existing users to determine next readableId
  const existingUsers = await prisma.user.findMany({
    orderBy: { readableId: 'asc' }
  });
  const nextUserId = existingUsers.length + 1;
  
  for (let i = 0; i < 20; i++) {
    const name = vietnameseNames[i % vietnameseNames.length];
    const email = `user${i + 6}@gmail.com`; // Start from user6 since we have 5 existing users
    const phone = `0123456${(i + 6).toString().padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash('user123', 12);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        name,
        phone,
        address: vietnameseAddresses[i % vietnameseAddresses.length],
        readableId: generateReadableId('USR', nextUserId + i),
        createdAt: getRandomDate(new Date('2024-01-01'), new Date()),
      },
    });
    additionalUsers.push(user);
  }

  console.log(`✅ Created ${additionalUsers.length} additional users`);

  // Create historical orders spanning last 6 months
  console.log('📦 Creating historical orders...');
  const startDate = new Date('2024-01-01');
  const endDate = new Date();
  const orderStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const paymentMethods: PaymentMethod[] = ['COD', 'BANK_TRANSFER', 'STRIPE', 'MOMO', 'VNPAY'];

  // Get existing orders to determine next readableId
  const existingOrders = await prisma.order.findMany({
    orderBy: { readableId: 'asc' }
  });
  let orderIndex = existingOrders.length + 1;
  const allUsers = await prisma.user.findMany();
  
  // Create 100 historical orders
  for (let i = 0; i < 100; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const orderDate = getRandomDate(startDate, endDate);
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    const total = parseFloat(randomProduct.price.toString()) * quantity;
    const address = vietnameseAddresses[Math.floor(Math.random() * vietnameseAddresses.length)];

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: randomUser.id,
        total: total.toString(),
        status,
        paymentMethod,
        shippingAddress: `${randomUser.name}, ${randomUser.phone}, ${address}`,
        createdAt: orderDate,
        updatedAt: orderDate,
        readableId: generateReadableId('ORD', orderIndex),
      },
    });

    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: randomProduct.id,
        quantity,
        price: randomProduct.price,
      },
    });

    // Update product sold count
    await prisma.product.update({
      where: { id: randomProduct.id },
      data: {
        soldCount: {
          increment: quantity,
        },
      },
    });

    orderIndex++;
  }

  console.log(`✅ Created ${orderIndex - 1} historical orders`);

  // Create comprehensive reviews
  console.log('⭐ Creating comprehensive reviews...');
  // Get existing reviews to determine next readableId
  const existingReviews = await prisma.review.findMany({
    orderBy: { readableId: 'asc' }
  });
  let reviewIndex = existingReviews.length + 1;

  // Create reviews for each product
  for (const product of products) {
    // Create 3-8 reviews per product
    const numReviews = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < numReviews; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const rating = Math.floor(Math.random() * 2) + 4; // Mostly 4-5 stars
      const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
      const reviewDate = getRandomDate(startDate, endDate);

      await prisma.review.create({
        data: {
          userId: randomUser.id,
          productId: product.id,
          rating,
          comment,
          createdAt: reviewDate,
          readableId: generateReadableId('REV', reviewIndex),
        },
      });

      reviewIndex++;
    }
  }

  console.log(`✅ Created ${reviewIndex - 1} reviews`);

  // Create guest orders
  console.log('👤 Creating guest orders...');
  const guestNames = [
    'Nguyễn Văn Khách', 'Trần Thị Khách', 'Lê Văn Khách', 'Phạm Thị Khách',
    'Hoàng Văn Khách', 'Vũ Thị Khách', 'Đặng Văn Khách', 'Bùi Thị Khách'
  ];

  for (let i = 0; i < 15; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 2) + 1;
    const orderDate = getRandomDate(startDate, endDate);
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const total = parseFloat(randomProduct.price.toString()) * quantity;
    const guestName = guestNames[i % guestNames.length];
    const guestEmail = `guest${i + 1}@example.com`;
    const guestPhone = `0987654${(i + 1).toString().padStart(3, '0')}`;
    const address = vietnameseAddresses[Math.floor(Math.random() * vietnameseAddresses.length)];

    const order = await prisma.order.create({
      data: {
        guestName,
        guestEmail,
        guestPhone,
        total: total.toString(),
        status,
        paymentMethod: 'COD',
        shippingAddress: `${guestName}, ${guestPhone}, ${address}`,
        createdAt: orderDate,
        updatedAt: orderDate,
        readableId: generateReadableId('ORD', orderIndex),
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: randomProduct.id,
        quantity,
        price: randomProduct.price,
      },
    });

    // Update product sold count
    await prisma.product.update({
      where: { id: randomProduct.id },
      data: {
        soldCount: {
          increment: quantity,
        },
      },
    });

    orderIndex++;
  }

  console.log('✅ Created 15 guest orders');

  // Create notifications
  console.log('🔔 Creating notifications...');
  const notificationTypes = ['ORDER', 'STOCK', 'PAYMENT', 'SYSTEM', 'PROMOTION'];
  const recipientTypes = ['ADMIN', 'USER'];

  for (let i = 0; i < 30; i++) {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const notificationDate = getRandomDate(startDate, endDate);
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const recipientType = recipientTypes[Math.floor(Math.random() * recipientTypes.length)];

    const titles = {
      ORDER: ['Đơn hàng mới', 'Đơn hàng đã giao', 'Cập nhật trạng thái đơn hàng'],
      STOCK: ['Sản phẩm sắp hết hàng', 'Cập nhật kho hàng', 'Nhập hàng mới'],
      PAYMENT: ['Thanh toán thành công', 'Xác nhận thanh toán', 'Hoàn tiền'],
      SYSTEM: ['Bảo trì hệ thống', 'Cập nhật ứng dụng', 'Thông báo quan trọng'],
      PROMOTION: ['Khuyến mãi mới', 'Giảm giá đặc biệt', 'Ưu đãi cuối tuần']
    };

    const bodies = {
      ORDER: ['Đơn hàng của bạn đã được xác nhận', 'Đơn hàng đang được giao', 'Đơn hàng đã giao thành công'],
      STOCK: ['Sản phẩm yêu thích sắp hết hàng', 'Kho hàng đã được cập nhật', 'Sản phẩm mới đã có sẵn'],
      PAYMENT: ['Thanh toán đã được xử lý', 'Giao dịch thành công', 'Hoàn tiền đã được thực hiện'],
      SYSTEM: ['Hệ thống sẽ bảo trì trong 2 giờ', 'Ứng dụng đã được cập nhật', 'Vui lòng kiểm tra thông tin'],
      PROMOTION: ['Giảm 20% cho tất cả sản phẩm', 'Miễn phí vận chuyển cho đơn trên 500k', 'Ưu đãi đặc biệt cuối tuần']
    };

    const title = titles[type][Math.floor(Math.random() * titles[type].length)];
    const body = bodies[type][Math.floor(Math.random() * bodies[type].length)];

    await prisma.notification.create({
      data: {
        title,
        body,
        type: type as any,
        recipientType: recipientType as any,
        userId: randomUser.id,
        isRead: Math.random() > 0.3, // 70% read
        createdAt: notificationDate,
        updatedAt: notificationDate,
      },
    });
  }

  console.log('✅ Created 30 notifications');

  // Create addresses for users
  console.log('📍 Creating user addresses...');
  for (const user of allUsers) {
    if (Math.random() > 0.3) { // 70% of users have addresses
      const addressIndex = Math.floor(Math.random() * vietnameseAddresses.length);
      const address = vietnameseAddresses[addressIndex];
      const addressParts = address.split(', ');
      
      await prisma.address.create({
        data: {
          userId: user.id,
          fullName: user.name || 'Unknown',
          phone: user.phone || '0123456789',
          address: addressParts[0] || 'Unknown',
          apartment: Math.random() > 0.5 ? `Tầng ${Math.floor(Math.random() * 20) + 1}` : null,
          province: addressParts[2] || 'TP.HCM',
          district: addressParts[1] || 'Quận 1',
          ward: `Phường ${Math.floor(Math.random() * 20) + 1}`,
          country: 'Vietnam',
          isDefault: true,
        },
      });
    }
  }

  console.log('✅ Created user addresses');

  // Create wishlist items
  console.log('💖 Creating wishlist items...');
  for (const user of allUsers) {
    const numWishlistItems = Math.floor(Math.random() * 3); // 0-2 items per user
    const selectedProducts: string[] = [];
    
    for (let i = 0; i < numWishlistItems; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      // Check if this user already has this product in wishlist
      const existingWishlist = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId: randomProduct.id,
          },
        },
      });
      
      // Only add if not already in wishlist and not already selected for this user
      if (!existingWishlist && !selectedProducts.includes(randomProduct.id)) {
        selectedProducts.push(randomProduct.id);
        
        await prisma.wishlist.create({
          data: {
            userId: user.id,
            productId: randomProduct.id,
          },
        });
      }
    }
  }

  console.log('✅ Created wishlist items');

  // Create cart items
  console.log('🛒 Creating cart items...');
  for (const user of allUsers) {
    if (Math.random() > 0.7) { // 30% of users have cart items
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: randomProduct.id,
          quantity,
        },
      });
    }
  }

  console.log('✅ Created cart items');

  // Final statistics
  const finalStats = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.review.count(),
    prisma.notification.count(),
    prisma.address.count(),
    prisma.wishlist.count(),
    prisma.cartItem.count(),
  ]);

  console.log('\n📊 Final Statistics:');
  console.log(`👥 Users: ${finalStats[0]}`);
  console.log(`📦 Orders: ${finalStats[1]}`);
  console.log(`⭐ Reviews: ${finalStats[2]}`);
  console.log(`🔔 Notifications: ${finalStats[3]}`);
  console.log(`📍 Addresses: ${finalStats[4]}`);
  console.log(`💖 Wishlist Items: ${finalStats[5]}`);
  console.log(`🛒 Cart Items: ${finalStats[6]}`);

  console.log('\n🎉 Historical data creation completed!');
  console.log('📈 Admin analytics should now show comprehensive data spanning the last 6 months.');
}

main()
  .catch((e) => {
    console.error('❌ Historical data creation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 