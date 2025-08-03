import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../common/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';

@Command({
  name: 'populate-readable-ids',
  description: 'Populate readable IDs for existing records',
})
export class PopulateReadableIdsCommand extends CommandRunner {
  constructor(
    private prisma: PrismaService,
    private idGenerator: IdGeneratorService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('🔄 Populating readable IDs for existing records...');
    
    try {
      // Populate Product readable IDs
      console.log('📦 Processing Products...');
      const products = await this.prisma.product.findMany({
        where: { readableId: null },
        select: { id: true }
      });
      
      for (const product of products) {
        const readableId = await this.idGenerator.generateReadableId('PRODUCT');
        await this.prisma.product.update({
          where: { id: product.id },
          data: { readableId }
        });
        console.log(`  ✅ Product ${product.id.slice(-8)} → ${readableId}`);
      }

      // Populate Category readable IDs
      console.log('📂 Processing Categories...');
      const categories = await this.prisma.category.findMany({
        where: { readableId: null },
        select: { id: true }
      });
      
      for (const category of categories) {
        const readableId = await this.idGenerator.generateReadableId('CATEGORY');
        await this.prisma.category.update({
          where: { id: category.id },
          data: { readableId }
        });
        console.log(`  ✅ Category ${category.id.slice(-8)} → ${readableId}`);
      }

      // Populate User readable IDs
      console.log('👤 Processing Users...');
      const users = await this.prisma.user.findMany({
        where: { readableId: null },
        select: { id: true }
      });
      
      for (const user of users) {
        const readableId = await this.idGenerator.generateReadableId('USER');
        await this.prisma.user.update({
          where: { id: user.id },
          data: { readableId }
        });
        console.log(`  ✅ User ${user.id.slice(-8)} → ${readableId}`);
      }

      // Populate Order readable IDs
      console.log('📋 Processing Orders...');
      const orders = await this.prisma.order.findMany({
        where: { readableId: null },
        select: { id: true }
      });
      
      for (const order of orders) {
        const readableId = await this.idGenerator.generateReadableId('ORDER');
        await this.prisma.order.update({
          where: { id: order.id },
          data: { readableId }
        });
        console.log(`  ✅ Order ${order.id.slice(-8)} → ${readableId}`);
      }

      // Populate Review readable IDs
      console.log('⭐ Processing Reviews...');
      const reviews = await this.prisma.review.findMany({
        where: { readableId: null },
        select: { id: true }
      });
      
      for (const review of reviews) {
        const readableId = await this.idGenerator.generateReadableId('REVIEW');
        await this.prisma.review.update({
          where: { id: review.id },
          data: { readableId }
        });
        console.log(`  ✅ Review ${review.id.slice(-8)} → ${readableId}`);
      }

      console.log('✅ Successfully populated readable IDs for all existing records!');
      
      // Show summary
      const summary = await this.prisma.$transaction([
        this.prisma.product.count({ where: { readableId: { not: null } } }),
        this.prisma.category.count({ where: { readableId: { not: null } } }),
        this.prisma.user.count({ where: { readableId: { not: null } } }),
        this.prisma.order.count({ where: { readableId: { not: null } } }),
        this.prisma.review.count({ where: { readableId: { not: null } } }),
      ]);
      
      console.log('\n📊 Summary:');
      console.log(`  Products: ${summary[0]} with readable IDs`);
      console.log(`  Categories: ${summary[1]} with readable IDs`);
      console.log(`  Users: ${summary[2]} with readable IDs`);
      console.log(`  Orders: ${summary[3]} with readable IDs`);
      console.log(`  Reviews: ${summary[4]} with readable IDs`);

    } catch (error) {
      console.error('❌ Error populating readable IDs:', error);
      throw error;
    }
  }
} 