import { Command, CommandRunner } from 'nest-commander';
import { SoldCountService } from './sold-count.service';

@Command({
  name: 'init-sold-counts',
  description: 'Initialize sold counts for all products based on completed orders',
})
export class InitSoldCountsCommand extends CommandRunner {
  constructor(private soldCountService: SoldCountService) {
    super();
  }

  async run(): Promise<void> {
    console.log('🔄 Initializing sold counts for all products...');
    
    try {
      await this.soldCountService.updateAllSoldCounts();
      console.log('✅ Successfully updated sold counts for all products!');
    } catch (error) {
      console.error('❌ Error updating sold counts:', error);
      throw error;
    }
  }
} 