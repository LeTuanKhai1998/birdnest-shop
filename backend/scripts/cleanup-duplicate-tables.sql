-- Database Cleanup Script: Remove Duplicate Tables
-- This script removes the singular-named tables created by Prisma
-- and keeps only the plural-named tables used by the Go backend

-- Drop singular-named tables (Prisma tables)
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "CartItem" CASCADE;
DROP TABLE IF EXISTS "Address" CASCADE;
DROP TABLE IF EXISTS "Wishlist" CASCADE;
DROP TABLE IF EXISTS "Image" CASCADE;

-- Drop Prisma migration tables
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Verify remaining tables (should only have plural-named tables)
-- These are the correct tables used by the Go backend:
-- - users
-- - products  
-- - categories
-- - orders
-- - order_items
-- - reviews
-- - cart_items
-- - addresses
-- - wishlist
-- - images
-- - tokens
-- - schema_migrations

-- Show remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name; 