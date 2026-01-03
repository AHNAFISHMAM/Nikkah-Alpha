-- =============================================
-- DROP ALL TABLES - FRESH START
-- =============================================
-- WARNING: This will delete ALL data in your database
-- Only use this if you want to start completely fresh
-- =============================================
-- This is the NUCLEAR OPTION - drops everything
-- =============================================

-- Drop all tables (CASCADE removes all dependencies)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Recreate extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: The handle_new_user trigger on auth.users will also be dropped
-- It will be recreated when you run ALL_MIGRATIONS_CONSOLIDATED.sql

-- =============================================
-- VERIFICATION
-- =============================================
-- Check that all tables are dropped
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
--
-- Should return no tables (or only tables you want to keep)
-- =============================================

-- Next step: Run ALL_MIGRATIONS_CONSOLIDATED.sql
