# Database Scripts

This directory contains utility scripts for database management.

## Clear Database Script

The `clear-db.ts` script allows you to safely clear data from the database while preserving the schema structure.

### Features

- 🛡️ **Safe**: Requires confirmation before clearing data
- 🎯 **Selective**: Clear specific data types or all data
- 📊 **Informative**: Shows current data counts before and after
- 🔧 **Flexible**: Multiple usage modes (interactive, command-line)

### Usage

#### Interactive Mode (Recommended)
```bash
npm run clear-db
```
This will show you a menu to choose what to clear:
1. All data (default)
2. Orders only
3. Users only
4. Products only
5. Reviews only
6. Custom selection

#### Command Line Mode

```bash
# Clear all data
npm run clear-db -- --all

# Clear specific data types
npm run clear-db -- --orders
npm run clear-db -- --users
npm run clear-db -- --products
npm run clear-db -- --reviews

# Skip confirmation (use with caution!)
npm run clear-db -- --all --force

# Show help
npm run clear-db -- --help
```

### What Gets Cleared

The script clears data in the correct order to avoid foreign key constraint violations:

1. **Notifications** - User notifications
2. **Reviews** - Product reviews
3. **Order Items** - Individual items in orders
4. **Orders** - Customer orders
5. **Addresses** - User addresses
6. **Wishlist** - User wishlist items
7. **Settings** - System settings
8. **Users** - User accounts
9. **Images** - Product images (must be before products)
10. **Products** - Product catalog (must be before categories)
11. **Categories** - Product categories

### Safety Features

- ✅ **Confirmation Required**: Script asks for confirmation before clearing
- ✅ **Data Counts**: Shows current data counts before and after
- ✅ **Foreign Key Aware**: Clears data in correct order
- ✅ **Error Handling**: Proper error handling and cleanup
- ✅ **Database Connection**: Properly closes database connections

### Examples

#### Clear All Data
```bash
npm run clear-db -- --all
```

#### Clear Only Orders (for testing)
```bash
npm run clear-db -- --orders
```

#### Interactive Custom Selection
```bash
npm run clear-db
# Then choose option 6 and select what to clear
```

### Development Use Cases

- **Testing**: Clear test data between test runs
- **Development**: Start with a clean database
- **Debugging**: Remove problematic data
- **Demo**: Reset to initial state for demonstrations

### Warning

⚠️ **This action cannot be undone!** Always make sure you have backups if you're working with production data.

### Integration

The script can be imported and used in other scripts:

```typescript
import { clearDatabase, getTableCounts } from './scripts/clear-db';

// Get current counts
const counts = await getTableCounts();

// Clear specific data
await clearDatabase({ orders: true, users: true });
``` 