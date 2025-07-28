-- Drop indexes
DROP INDEX IF EXISTS idx_addresses_user_id;
DROP INDEX IF EXISTS idx_cart_items_user_id;
DROP INDEX IF EXISTS idx_reviews_product_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_slug;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Drop enum types
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS order_status; 