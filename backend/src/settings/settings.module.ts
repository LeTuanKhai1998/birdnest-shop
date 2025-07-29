import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaService } from '../common/prisma.service';
import { CacheService } from '../common/cache.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, CacheService],
  exports: [SettingsService],
})
export class SettingsModule {} 