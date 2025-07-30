import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CacheService } from '../common/cache.service';

export interface SettingsData {
  storeName: string;
  storeEmail: string;
  storePhone?: string;
  defaultLanguage: 'en' | 'vi';
  currency: string;
  taxPercent: number;
  freeShippingThreshold: number;
  enableStripe: boolean;
  enableMomo: boolean;
  enableCOD: boolean;
  maintenanceMode: boolean;
  logoUrl?: string;
  address?: string;
  country?: string;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly cacheKey = 'settings:all';

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async getAllSettings(): Promise<SettingsData> {
    // Try to get from cache first
    const cached = this.cacheService.get<SettingsData>(this.cacheKey);
    if (cached) {
      return cached;
    }

    const settings = await this.prisma.setting.findMany();
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const defaultSettings: SettingsData = {
      storeName: settingsMap.get('store_name') || 'Birdnest Shop',
      storeEmail: settingsMap.get('store_email') || 'admin@birdnest.com',
      storePhone: settingsMap.get('store_phone') || '',
      defaultLanguage:
        (settingsMap.get('default_language') as 'en' | 'vi') || 'en',
      currency: settingsMap.get('currency') || 'VND',
      taxPercent: parseFloat(settingsMap.get('tax_percent') || '0'),
      freeShippingThreshold: parseFloat(
        settingsMap.get('free_shipping_threshold') || '0',
      ),
      enableStripe: settingsMap.get('enable_stripe') === 'true',
      enableMomo: settingsMap.get('enable_momo') === 'true',
      enableCOD: settingsMap.get('enable_cod') === 'true',
      maintenanceMode: settingsMap.get('maintenance_mode') === 'true',
      logoUrl: settingsMap.get('logo_url') || '',
      address: settingsMap.get('address') || '',
      country: settingsMap.get('country') || 'Vietnam',
    };

    // Cache for 10 minutes
    this.cacheService.set(this.cacheKey, defaultSettings, 600000);

    return defaultSettings;
  }

  async updateSettings(data: Partial<SettingsData>): Promise<SettingsData> {
    const settingsToUpdate = [
      ...(data.storeName !== undefined
        ? [{ key: 'store_name', value: data.storeName }]
        : []),
      ...(data.storeEmail !== undefined
        ? [{ key: 'store_email', value: data.storeEmail }]
        : []),
      ...(data.storePhone !== undefined
        ? [{ key: 'store_phone', value: data.storePhone }]
        : []),
      ...(data.defaultLanguage !== undefined
        ? [{ key: 'default_language', value: data.defaultLanguage }]
        : []),
      ...(data.currency !== undefined
        ? [{ key: 'currency', value: data.currency }]
        : []),
      ...(data.taxPercent !== undefined
        ? [{ key: 'tax_percent', value: data.taxPercent.toString() }]
        : []),
      ...(data.freeShippingThreshold !== undefined
        ? [
            {
              key: 'free_shipping_threshold',
              value: data.freeShippingThreshold.toString(),
            },
          ]
        : []),
      ...(data.enableStripe !== undefined
        ? [{ key: 'enable_stripe', value: data.enableStripe.toString() }]
        : []),
      ...(data.enableMomo !== undefined
        ? [{ key: 'enable_momo', value: data.enableMomo.toString() }]
        : []),
      ...(data.enableCOD !== undefined
        ? [{ key: 'enable_cod', value: data.enableCOD.toString() }]
        : []),
      ...(data.maintenanceMode !== undefined
        ? [{ key: 'maintenance_mode', value: data.maintenanceMode.toString() }]
        : []),
      ...(data.logoUrl !== undefined
        ? [{ key: 'logo_url', value: data.logoUrl }]
        : []),
      ...(data.address !== undefined
        ? [{ key: 'address', value: data.address }]
        : []),
      ...(data.country !== undefined
        ? [{ key: 'country', value: data.country }]
        : []),
    ];

    // Update settings in transaction
    await this.prisma.$transaction(async (tx) => {
      for (const setting of settingsToUpdate) {
        await tx.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        });
      }
    });

    // Invalidate cache
    this.cacheService.delete(this.cacheKey);

    // Return updated settings
    return this.getAllSettings();
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Invalidate cache
    this.cacheService.delete(this.cacheKey);
  }
}
