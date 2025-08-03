import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SoldCountService } from './sold-count.service';
import { InitSoldCountsCommand } from './init-sold-counts.command';
import { CreateTestOrdersCommand } from './create-test-orders.command';
import { PopulateReadableIdsCommand } from './populate-readable-ids.command';
import { PrismaService } from '../common/prisma.service';
import { CacheService } from '../common/cache.service';
import { IdGeneratorService } from '../common/id-generator.service';

@Module({
  providers: [
    ProductsService, 
    SoldCountService, 
    IdGeneratorService,
    InitSoldCountsCommand, 
    CreateTestOrdersCommand,
    PopulateReadableIdsCommand,
    PrismaService, 
    CacheService
  ],
  controllers: [ProductsController],
  exports: [ProductsService, SoldCountService, IdGeneratorService],
})
export class ProductsModule {}
