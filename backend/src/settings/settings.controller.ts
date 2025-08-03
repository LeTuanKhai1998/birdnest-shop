import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService, SettingsData } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll(): Promise<SettingsData> {
    return this.settingsService.getAllSettings();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createOrUpdate(
    @Body() data: UpdateSettingsDto,
  ): Promise<SettingsData> {
    return this.settingsService.updateSettings(data);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateSettings(
    @Body() data: UpdateSettingsDto,
  ): Promise<SettingsData> {
    return this.settingsService.updateSettings(data);
  }
}
