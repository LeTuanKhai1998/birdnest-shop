import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../common/prisma.service';
import { SoldCountService } from './sold-count.service';

@Command({
  name: 'create-test-orders',
  description: 'Create test orders to demonstrate sold count functionality',
})
export class CreateTestOrdersCommand extends CommandRunner {
  constructor(
    private prisma: PrismaService,
    private soldCountService: SoldCountService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('🔄 Creating test orders...');
    
    try {
      // Get all products
      const products = await this.prisma.product.findMany({
        take: 5, // Limit to first 5 products
      });

      if (products.length === 0) {
        console.log('❌ No products found. Please create products first.');
        return;
      }

      // Create test orders for each product
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const orderQuantity = Math.floor(Math.random() * 5) + 1; // Random quantity 1-5

        // Create order
        const order = await this.prisma.order.create({
          data: {
            total: (parseFloat(product.price.toString()) * orderQuantity).toString(),
            status: 'DELIVERED', // Completed order
            paymentMethod: 'COD',
            shippingAddress: 'Test Address',
            guestEmail: `test${i + 1}@example.com`,
            guestName: `Test User ${i + 1}`,
            guestPhone: `012345678${i}`,
          },
        });

        // Create order item
        await this.prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: orderQuantity,
            price: product.price,
          },
        });

        console.log(`✅ Created order for ${product.name} with quantity ${orderQuantity}`);
      }

      // Update sold counts
      console.log('🔄 Updating sold counts...');
      await this.soldCountService.updateAllSoldCounts();
      
      console.log('✅ Test orders created and sold counts updated!');
      
      // Show final sold counts
      const updatedProducts = await this.prisma.product.findMany({
        select: { name: true, soldCount: true },
        take: 5,
      });
      
      console.log('\n📊 Final sold counts:');
      updatedProducts.forEach(product => {
        console.log(`  ${product.name}: ${product.soldCount} sold`);
      });

    } catch (error) {
      console.error('❌ Error creating test orders:', error);
      throw error;
    }
  }
} 