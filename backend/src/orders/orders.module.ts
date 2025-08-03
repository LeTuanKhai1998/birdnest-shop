import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../common/prisma.service';
import { IdGeneratorService } from '../common/id-generator.service';

@Module({
  providers: [OrdersService, PrismaService, IdGeneratorService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
