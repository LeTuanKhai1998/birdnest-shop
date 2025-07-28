-- Drop indexes for tokens table
DROP INDEX IF EXISTS idx_tokens_type;
DROP INDEX IF EXISTS idx_tokens_user_id;

-- Drop tokens table
DROP TABLE IF EXISTS tokens;
