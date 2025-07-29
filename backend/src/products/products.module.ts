import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../common/prisma.service';
import { CacheService } from '../common/cache.service';

@Module({
  providers: [ProductsService, PrismaService, CacheService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
