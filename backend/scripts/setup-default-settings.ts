import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDefaultSettings() {
  console.log('⚙️ Setting up default settings...');

  const defaultSettings = [
    { key: 'store_name', value: 'Birdnest Shop' },
    { key: 'store_email', value: 'admin@birdnest.com' },
    { key: 'store_phone', value: '' },
    { key: 'currency', value: 'VND' },
    { key: 'tax_percent', value: '0' },
    { key: 'free_shipping_threshold', value: '950000' }, // 950,000 VND
    { key: 'enable_stripe', value: 'true' },
    { key: 'enable_momo', value: 'true' },
    { key: 'enable_cod', value: 'true' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'logo_url', value: '' },
    { key: 'address', value: '' },
    { key: 'province', value: '' },
    { key: 'district', value: '' },
    { key: 'ward', value: '' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`✅ Set ${setting.key} = ${setting.value}`);
  }

  console.log('🎉 Default settings setup complete!');
}

setupDefaultSettings()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 