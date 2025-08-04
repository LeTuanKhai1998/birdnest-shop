# Free Shipping Threshold Implementation

## Overview

The free shipping threshold is now dynamically managed through the settings system, replacing the hardcoded value of 950,000 VND.

## Current Implementation

### Frontend Components

1. **PromotionalBanner Component** (`frontend/components/home/PromotionalBanner.tsx`)
   - Uses `useFreeShippingThreshold()` hook to get the current threshold
   - Uses `formatCurrency()` function to format the amount properly
   - Displays: "Giao hàng MIỄN PHÍ - Đơn hàng từ {formatted_amount} trở lên"

2. **Settings Context** (`frontend/lib/settings-context.tsx`)
   - Provides `useFreeShippingThreshold()` hook
   - Default fallback value: 950,000 VND
   - Automatically loads settings from backend API

3. **Shipping Utils** (`frontend/lib/shipping-utils.ts`)
   - `formatCurrency()` function for proper VND formatting
   - `calculateShippingFee()` function uses the threshold
   - `isFreeShipping()` function checks if cart qualifies

### Backend API

1. **Settings Service** (`backend/src/settings/settings.service.ts`)
   - Stores threshold in database as `free_shipping_threshold`
   - Default value: 950,000 VND
   - Cached for performance

2. **Settings Controller** (`backend/src/settings/settings.controller.ts`)
   - `GET /api/settings` - Returns all settings including threshold
   - `PATCH /api/settings` - Updates settings (admin only)

## Database Schema

The threshold is stored in the `Setting` table:
```sql
key: 'free_shipping_threshold'
value: '950000'  -- 950,000 VND
```

## How to Change the Threshold

### Method 1: Admin Dashboard
1. Go to `/admin/settings`
2. Update the "Free Shipping Threshold" field
3. Save changes

### Method 2: Database Direct Update
```sql
UPDATE "Setting" 
SET value = '1500000' 
WHERE key = 'free_shipping_threshold';
```

### Method 3: API Call
```bash
curl -X PATCH http://localhost:8080/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"freeShippingThreshold": 1500000}'
```

### Method 4: Setup Script
```bash
cd birdnest-backend
npm run setup-settings
```

## Default Values

- **Database**: 950,000 VND (950,000)
- **Frontend Fallback**: 950,000 VND (950,000)
- **Backend Fallback**: 950,000 VND (950,000)

## Testing

1. **API Test**:
   ```bash
   curl http://localhost:8080/api/settings
   ```

2. **Frontend Test**:
   - Visit homepage
   - Check promotional banner shows correct amount
   - Verify formatting: "950.000 ₫"

## Files Modified

- ✅ `frontend/components/home/PromotionalBanner.tsx` - Already using dynamic value
- ✅ `frontend/lib/settings-context.tsx` - Updated default to 1,000,000 VND
- ✅ `backend/src/settings/settings.service.ts` - Updated default to 1,000,000 VND
- ✅ `backend/prisma/seed.ts` - Added settings setup
- ✅ `backend/scripts/setup-default-settings.ts` - Created setup script
- ✅ `backend/package.json` - Added setup-settings script

## Benefits

1. **Dynamic**: Can be changed without code deployment
2. **Admin-Friendly**: Can be updated through admin dashboard
3. **Consistent**: Same value used across all components
4. **Cached**: Backend caches settings for performance
5. **Fallback**: Frontend has fallback values if API fails 