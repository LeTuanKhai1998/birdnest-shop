# Settings Integration Guide

This document explains how to use the comprehensive settings system that has been implemented across the entire Birdnest Shop application.

## Overview

The settings system provides a centralized way to manage store configuration, payment methods, currency, tax rates, and other business settings. These settings are automatically applied across all pages and components.

## Architecture

### 1. Settings Context (`/lib/settings-context.tsx`)

The main context provider that manages global settings state:

```typescript
// Main context hook
const { settings, loading, error, refreshSettings, updateSettings } = useSettings();

// Specific setting hooks
const storeName = useSetting('storeName');
const currency = useCurrency();
const taxPercent = useTaxPercent();
const stripeEnabled = useFeatureEnabled('stripe');
```

### 2. Currency Utilities (`/lib/currency-utils.ts`)

Utility functions for currency formatting and calculations:

```typescript
// Format currency based on store settings
const formattedPrice = formatCurrency(1000000, 'VND'); // "1.000.000 ₫"

// Calculate tax and totals
const taxAmount = calculateTax(orderTotal, taxPercent);
const totalWithTax = calculateTotalWithTax(orderTotal, taxPercent);

// Check free shipping eligibility
const isFreeShipping = qualifiesForFreeShipping(orderTotal, threshold);
```

### 3. Settings Provider Integration

The settings provider is automatically included in the main app layout:

```typescript
// In /components/Providers.tsx
<SettingsProvider>
  <NotificationProvider>
    <PageLoadingProvider>
      {children}
    </PageLoadingProvider>
  </NotificationProvider>
</SettingsProvider>
```

## Available Settings

### Store Information
- `storeName`: Store name (used in navbar, footer, page titles)
- `storeEmail`: Contact email
- `storePhone`: Contact phone number
- `logoUrl`: Store logo URL
- `address`: Store address
- `country`: Store country

### Business Configuration
- `currency`: Store currency (VND, USD, EUR, etc.)
- `taxPercent`: Tax percentage applied to orders
- `freeShippingThreshold`: Minimum order value for free shipping
- `defaultLanguage`: Default language (en/vi)

### Payment Methods
- `enableStripe`: Enable Stripe payments
- `enableMomo`: Enable MoMo payments
- `enableCOD`: Enable Cash on Delivery

### System Settings
- `maintenanceMode`: Enable/disable maintenance mode

## Usage Examples

### 1. In Components

```typescript
import { useSettings, useCurrencyFormat, useFeatureEnabled } from '@/lib/settings-context';

function ProductCard({ product }) {
  const { format } = useCurrencyFormat();
  const stripeEnabled = useFeatureEnabled('stripe');
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p className="price">{format(product.price)}</p>
      {stripeEnabled && (
        <button>Pay with Card</button>
      )}
    </div>
  );
}
```

### 2. In Pages

```typescript
import { useSetting } from '@/lib/settings-context';

export default function HomePage() {
  const storeName = useSetting('storeName');
  const maintenanceMode = useMaintenanceMode();
  
  if (maintenanceMode) {
    return <MaintenanceMode />;
  }
  
  return (
    <div>
      <h1>Welcome to {storeName}</h1>
      {/* Page content */}
    </div>
  );
}
```

### 3. Currency Formatting

```typescript
import { useCurrencyFormat } from '@/lib/currency-utils';

function OrderSummary({ order }) {
  const { format, currency } = useCurrencyFormat();
  
  return (
    <div>
      <p>Subtotal: {format(order.subtotal)}</p>
      <p>Tax: {format(order.tax)}</p>
      <p>Total: {format(order.total)}</p>
      <p>Currency: {currency}</p>
    </div>
  );
}
```

### 4. Payment Method Checks

```typescript
import { useFeatureEnabled } from '@/lib/settings-context';

function CheckoutForm() {
  const stripeEnabled = useFeatureEnabled('stripe');
  const momoEnabled = useFeatureEnabled('momo');
  const codEnabled = useFeatureEnabled('cod');
  
  return (
    <form>
      {stripeEnabled && (
        <div>
          <input type="radio" name="payment" value="stripe" />
          <label>Credit Card</label>
        </div>
      )}
      
      {momoEnabled && (
        <div>
          <input type="radio" name="payment" value="momo" />
          <label>MoMo</label>
        </div>
      )}
      
      {codEnabled && (
        <div>
          <input type="radio" name="payment" value="cod" />
          <label>Cash on Delivery</label>
        </div>
      )}
    </form>
  );
}
```

## Maintenance Mode

The maintenance mode automatically shows a maintenance page when enabled:

```typescript
// Automatically handled in layout.tsx
<MaintenanceMode />
```

When `maintenanceMode` is true, users see a professional maintenance page instead of the regular site.

## Settings Management

### Admin Settings Page

Admins can manage all settings through `/admin/settings`:

- General store information
- Payment method toggles
- Currency and tax configuration
- System settings

### API Endpoints

- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings (admin only)

### Database Storage

Settings are stored as key-value pairs in the `Setting` table:

```sql
CREATE TABLE Setting (
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
);
```

## Best Practices

### 1. Always Use Hooks

Instead of accessing settings directly, use the provided hooks:

```typescript
// ✅ Good
const storeName = useSetting('storeName');
const { format } = useCurrencyFormat();

// ❌ Bad
const settings = useSettings();
const storeName = settings?.storeName;
```

### 2. Provide Fallbacks

Always provide sensible defaults:

```typescript
const storeName = useSetting('storeName') || 'Birdnest Shop';
const currency = useCurrency() || 'VND';
```

### 3. Handle Loading States

```typescript
const { settings, loading } = useSettings();

if (loading) {
  return <LoadingSpinner />;
}

if (!settings) {
  return <ErrorState />;
}
```

### 4. Use Currency Utilities

For consistent currency formatting across the app:

```typescript
// ✅ Good - uses store settings
const { format } = useCurrencyFormat();
const price = format(product.price);

// ❌ Bad - hardcoded formatting
const price = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(product.price);
```

## Integration Points

### 1. Navbar (`/components/ResponsiveNavbar.tsx`)
- Uses `storeName` and `logoUrl` from settings
- Automatically updates when settings change

### 2. Footer (`/components/Footer.tsx`)
- Uses store contact information from settings
- Updates copyright and company name

### 3. Product Cards (`/components/ProductCard.tsx`)
- Uses currency formatting from settings
- Shows prices in correct format

### 4. Checkout (`/app/checkout/page.tsx`)
- Uses payment method settings
- Applies tax and shipping calculations
- Shows/hides payment options based on settings

### 5. Admin Dashboard
- Settings management interface
- Real-time updates across the application

## Testing

### Unit Tests

```typescript
// Test currency formatting
describe('Currency Utils', () => {
  it('formats VND correctly', () => {
    expect(formatCurrency(1000000, 'VND')).toBe('1.000.000 ₫');
  });
  
  it('calculates tax correctly', () => {
    expect(calculateTax(1000000, 10)).toBe(100000);
  });
});
```

### Integration Tests

```typescript
// Test settings context
describe('Settings Context', () => {
  it('provides default settings', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings?.storeName).toBe('Birdnest Shop');
  });
});
```

## Performance Considerations

1. **Caching**: Settings are cached for 10 minutes on the backend
2. **Lazy Loading**: Settings are loaded once and shared across components
3. **Fallbacks**: Default values prevent loading delays
4. **Optimization**: Only re-render components when relevant settings change

## Troubleshooting

### Common Issues

1. **Settings not loading**: Check API connectivity and admin authentication
2. **Currency not formatting**: Ensure currency setting is valid
3. **Payment methods not showing**: Verify payment method toggles are enabled
4. **Maintenance mode stuck**: Check if maintenance mode is disabled in admin

### Debug Mode

Enable debug logging in development:

```typescript
// In settings context
console.log('Settings loaded:', settings);
console.log('Currency:', currency);
console.log('Payment methods:', { stripe: stripeEnabled, momo: momoEnabled, cod: codEnabled });
```

## Future Enhancements

1. **Multi-language support**: Expand language settings
2. **Theme customization**: Add color scheme settings
3. **Advanced shipping**: Zone-based shipping rules
4. **Analytics integration**: Track settings usage
5. **A/B testing**: Feature flag management

This settings system provides a robust foundation for managing store configuration and ensures consistency across the entire application. 