import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService, SettingsData } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll(): Promise<SettingsData> {
    return this.settingsService.getAllSettings();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createOrUpdate(@Body() data: Partial<SettingsData>): Promise<SettingsData> {
    return this.settingsService.updateSettings(data);
  }
}
