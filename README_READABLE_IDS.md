# Human-Readable IDs System

## Overview

The Birdnest Shop application now uses a dual ID system that provides both security and user-friendliness:

- **Internal IDs**: CUIDs for database operations (secure, unique)
- **Readable IDs**: Human-friendly IDs for user-facing operations

## ID Formats

### Readable ID Structure
```
PREFIX-YEAR-NUMBER
```

Examples:
- `PROD-2025-001` - Product #1 from 2025
- `ORD-2025-015` - Order #15 from 2025
- `USR-2025-003` - User #3 from 2025
- `CAT-2025-002` - Category #2 from 2025
- `REV-2025-008` - Review #8 from 2025

### Entity Type Prefixes
- `PROD` - Products
- `ORD` - Orders
- `USR` - Users
- `CAT` - Categories
- `REV` - Reviews

## Backend Implementation

### Database Schema
All major models now include a `readableId` field:

```prisma
model Product {
  id          String   @id @default(cuid())
  readableId  String?  @unique // Human-readable ID
  // ... other fields
}
```

### ID Generation Service
Located at `backend/src/common/id-generator.service.ts`

Key methods:
- `generateReadableId(entityType)` - Creates new readable IDs
- `generateShortId()` - Creates 6-character hash IDs
- `generateTimestampId()` - Creates timestamp-based IDs
- `extractReadableId(fullId)` - Extracts readable part from full ID

### Automatic ID Generation
New records automatically get readable IDs:

```typescript
// In ProductsService.create()
const readableId = await this.idGenerator.generateReadableId('PRODUCT');
const product = await this.prisma.product.create({
  data: {
    ...data,
    readableId, // Automatically added
  },
});
```

### CLI Commands
```bash
# Populate readable IDs for existing records
npm run populate-readable-ids

# Initialize sold counts
npm run init-sold-counts

# Create test orders
npm run create-test-orders
```

## Frontend Implementation

### Type Definitions
All interfaces include `readableId` field:

```typescript
export interface Product {
  id: string;
  readableId?: string; // Human-readable ID
  // ... other fields
}
```

### Utility Functions
Located at `frontend/lib/id-utils.ts`

Key functions:
- `formatReadableId(readableId, fallbackId)` - Formats ID for display
- `getShortId(readableId, fallbackId)` - Gets short version
- `getEntityTypeColor(entityType)` - Color coding by entity type
- `getEntityTypeLabel(entityType)` - Human-readable labels

### Reusable Components
Located at `frontend/components/ui/ReadableId.tsx`

Components:
- `<ReadableId />` - Generic readable ID component
- `<ProductId />` - Product-specific ID component
- `<OrderId />` - Order-specific ID component
- `<UserId />` - User-specific ID component
- `<CategoryId />` - Category-specific ID component
- `<ReviewId />` - Review-specific ID component

Usage examples:
```tsx
// Basic usage
<OrderId readableId={order.readableId} fallbackId={order.id} />

// With styling options
<OrderId 
  readableId={order.readableId} 
  fallbackId={order.id}
  size="lg"
  variant="badge"
  showType={true}
/>
```

## User Experience Improvements

### Before vs After

#### Product Detail Page
- **Before**: `Mã SP: Y74OVS5P` (confusing CUID)
- **After**: `Mã SP: PROD-2025-001` (clear, meaningful)

#### Admin Dashboard
- **Before**: `cmdsasn9m000dryfxy74ovs5p` (hard to reference)
- **After**: `ORD-2025-015` (easy to identify and discuss)

#### Support Tickets
- **Before**: "Order with ID cmdsasn9m000dryfxy74ovs5p"
- **After**: "Order ORD-2025-015" (much clearer)

### Visual Enhancements
- **Color-coded badges** by entity type
- **Tooltips** with full ID information
- **Consistent formatting** across all components
- **Fallback handling** for missing readable IDs

## Security & Best Practices

### Dual ID Strategy
- **Internal operations**: Use CUIDs for database queries
- **User-facing operations**: Use readable IDs for display
- **No security compromise** - internal IDs remain unchanged

### Scalability Features
- **Year-based numbering** prevents conflicts
- **Sequential within year** (001, 002, 003...)
- **Automatic generation** for new records
- **Backward compatibility** with existing CUIDs

### Validation
- **Unique constraints** on readable IDs
- **Format validation** using regex patterns
- **Error handling** for duplicate IDs

## Migration & Deployment

### Database Migration
```bash
# Run migration to add readableId fields
npx prisma migrate dev --name add_readable_ids

# Populate existing records
npm run populate-readable-ids
```

### Backward Compatibility
- Existing CUIDs remain functional
- Fallback to CUID display if readable ID missing
- No breaking changes to existing functionality

### Monitoring
- Track readable ID generation success rates
- Monitor for duplicate ID attempts
- Log ID generation performance

## Future Enhancements

### Potential Improvements
- **Custom prefixes** for different product categories
- **Regional formatting** (different formats per region)
- **Barcode integration** with readable IDs
- **QR code generation** for readable IDs

### Performance Optimizations
- **Caching** of ID generation sequences
- **Batch generation** for bulk operations
- **Indexing** on readable ID fields

## Troubleshooting

### Common Issues

#### Duplicate Readable IDs
```bash
# Check for duplicates
SELECT readableId, COUNT(*) FROM products GROUP BY readableId HAVING COUNT(*) > 1;

# Regenerate readable IDs
npm run populate-readable-ids
```

#### Missing Readable IDs
```bash
# Find records without readable IDs
SELECT id FROM products WHERE readableId IS NULL;

# Populate missing IDs
npm run populate-readable-ids
```

#### Performance Issues
- Ensure proper indexing on `readableId` fields
- Monitor ID generation performance
- Consider caching for high-traffic scenarios

## API Reference

### Backend Endpoints
All API responses now include `readableId` fields:

```json
{
  "id": "cmdsasn9m000dryfxy74ovs5p",
  "readableId": "PROD-2025-001",
  "name": "Yến tinh chế cao cấp 50g"
}
```

### Frontend Components
All components support readable ID display with fallback:

```tsx
<OrderId 
  readableId="ORD-2025-015"
  fallbackId="cmdsasn9m000dryfxy74ovs5p"
  size="md"
  variant="default"
  showType={true}
/>
```

## Conclusion

The human-readable ID system significantly improves user experience while maintaining security and scalability. The dual ID approach ensures that internal operations remain secure while providing clear, meaningful identifiers for users and administrators. 