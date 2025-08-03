import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface ClearOptions {
  notifications?: boolean;
  reviews?: boolean;
  orders?: boolean;
  addresses?: boolean;
  wishlist?: boolean;
  settings?: boolean;
  users?: boolean;
  images?: boolean;
  categories?: boolean;
  products?: boolean;
  all?: boolean;
}

async function askForConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function getTableCounts() {
  const counts = {
    notifications: await prisma.notification.count(),
    reviews: await prisma.review.count(),
    orderItems: await prisma.orderItem.count(),
    orders: await prisma.order.count(),
    addresses: await prisma.address.count(),
    wishlist: await prisma.wishlist.count(),
    settings: await prisma.setting.count(),
    users: await prisma.user.count(),
    images: await prisma.image.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
  };

  console.log('📊 Current database counts:');
  console.log(`   - Notifications: ${counts.notifications}`);
  console.log(`   - Reviews: ${counts.reviews}`);
  console.log(`   - Order Items: ${counts.orderItems}`);
  console.log(`   - Orders: ${counts.orders}`);
  console.log(`   - Addresses: ${counts.addresses}`);
  console.log(`   - Wishlist Items: ${counts.wishlist}`);
  console.log(`   - Settings: ${counts.settings}`);
  console.log(`   - Users: ${counts.users}`);
  console.log(`   - Images: ${counts.images}`);
  console.log(`   - Categories: ${counts.categories}`);
  console.log(`   - Products: ${counts.products}`);
  console.log('');

  return counts;
}

async function clearDatabase(options: ClearOptions = { all: true }) {
  console.log('🗑️  Starting database cleanup...');
  
  // Show current counts
  await getTableCounts();

  // Safety confirmation
  const confirmed = await askForConfirmation('⚠️  Are you sure you want to clear the database? This action cannot be undone!');
  if (!confirmed) {
    console.log('❌ Database cleanup cancelled.');
    return;
  }

  try {
    if (options.all || options.notifications) {
      console.log('📝 Clearing notifications...');
      await prisma.notification.deleteMany();
    }
    
    if (options.all || options.reviews) {
      console.log('⭐ Clearing reviews...');
      await prisma.review.deleteMany();
    }
    
    if (options.all || options.orders) {
      console.log('🛒 Clearing order items...');
      await prisma.orderItem.deleteMany();
      
      console.log('📦 Clearing orders...');
      await prisma.order.deleteMany();
    }
    
    if (options.all || options.addresses) {
      console.log('📍 Clearing addresses...');
      await prisma.address.deleteMany();
    }
    
    if (options.all || options.wishlist) {
      console.log('❤️  Clearing wishlist items...');
      await prisma.wishlist.deleteMany();
    }
    
    if (options.all || options.settings) {
      console.log('⚙️  Clearing settings...');
      await prisma.setting.deleteMany();
    }
    
    if (options.all || options.users) {
      console.log('👤 Clearing users...');
      await prisma.user.deleteMany();
    }
    
    if (options.all || options.images) {
      console.log('🖼️  Clearing images...');
      await prisma.image.deleteMany();
    }
    
    if (options.all || options.products) {
      console.log('🛍️  Clearing products...');
      await prisma.product.deleteMany();
    }
    
    if (options.all || options.categories) {
      console.log('🏷️  Clearing categories...');
      await prisma.category.deleteMany();
    }
    
    console.log('✅ Database cleared successfully!');
    
    // Show final counts
    await getTableCounts();
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function clearSpecificData() {
  console.log('🎯 Selective database cleanup');
  console.log('Choose what to clear:');
  console.log('1. All data (default)');
  console.log('2. Orders only');
  console.log('3. Users only');
  console.log('4. Products only');
  console.log('5. Reviews only');
  console.log('6. Custom selection');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<ClearOptions>((resolve) => {
    rl.question('Enter your choice (1-6): ', async (choice) => {
      rl.close();
      
      switch (choice.trim()) {
        case '1':
          resolve({ all: true });
          break;
        case '2':
          resolve({ orders: true });
          break;
        case '3':
          resolve({ users: true });
          break;
        case '4':
          resolve({ products: true });
          break;
        case '5':
          resolve({ reviews: true });
          break;
        case '6':
          console.log('Custom selection - specify what to clear:');
          const customOptions: ClearOptions = {};
          
          const clearNotifications = await askForConfirmation('Clear notifications?');
          if (clearNotifications) customOptions.notifications = true;
          
          const clearReviews = await askForConfirmation('Clear reviews?');
          if (clearReviews) customOptions.reviews = true;
          
          const clearOrders = await askForConfirmation('Clear orders?');
          if (clearOrders) customOptions.orders = true;
          
          const clearAddresses = await askForConfirmation('Clear addresses?');
          if (clearAddresses) customOptions.addresses = true;
          
          const clearWishlist = await askForConfirmation('Clear wishlist?');
          if (clearWishlist) customOptions.wishlist = true;
          
          const clearSettings = await askForConfirmation('Clear settings?');
          if (clearSettings) customOptions.settings = true;
          
          const clearUsers = await askForConfirmation('Clear users?');
          if (clearUsers) customOptions.users = true;
          
          const clearImages = await askForConfirmation('Clear images?');
          if (clearImages) customOptions.images = true;
          
          const clearCategories = await askForConfirmation('Clear categories?');
          if (clearCategories) customOptions.categories = true;
          
          const clearProducts = await askForConfirmation('Clear products?');
          if (clearProducts) customOptions.products = true;
          
          resolve(customOptions);
          break;
        default:
          console.log('Invalid choice, clearing all data...');
          resolve({ all: true });
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🗑️  Database Clear Script');
    console.log('');
    console.log('Usage:');
    console.log('  npm run clear-db                    # Interactive mode');
    console.log('  npm run clear-db --all              # Clear all data');
    console.log('  npm run clear-db --orders           # Clear orders only');
    console.log('  npm run clear-db --users            # Clear users only');
    console.log('  npm run clear-db --products         # Clear products only');
    console.log('  npm run clear-db --images           # Clear images only');
    console.log('  npm run clear-db --reviews          # Clear reviews only');
    console.log('  npm run clear-db --force            # Skip confirmation');
    console.log('');
    process.exit(0);
  }

  const options: ClearOptions = {};
  const force = args.includes('--force');

  if (args.includes('--all')) {
    options.all = true;
  } else if (args.includes('--orders')) {
    options.orders = true;
  } else if (args.includes('--users')) {
    options.users = true;
  } else if (args.includes('--products')) {
    options.products = true;
  } else if (args.includes('--images')) {
    options.images = true;
  } else if (args.includes('--reviews')) {
    options.reviews = true;
  } else {
    // Interactive mode
    const selectedOptions = await clearSpecificData();
    await clearDatabase(selectedOptions);
    console.log('🎉 Database cleanup completed!');
    process.exit(0);
  }

  // Non-interactive mode
  await clearDatabase(options);
  console.log('🎉 Database cleanup completed!');
  process.exit(0);
}

// Run the script if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Database cleanup failed:', error);
    process.exit(1);
  });
}

export { clearDatabase, getTableCounts }; 