import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService, SettingsData } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<SettingsData> {
    return this.settingsService.getAllSettings();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Body() data: Partial<SettingsData>): Promise<SettingsData> {
    return this.settingsService.updateSettings(data);
  }
} 