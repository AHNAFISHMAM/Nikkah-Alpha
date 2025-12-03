-- =============================================
-- Financial Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the Financial page are in place.
--
-- Page: /dashboard/financial (Financial.tsx)
-- Tools:
--   1. Mahr Calculator (calculations only, no persistence)
--   2. Wedding Budget (calculations only, no persistence)
--   3. Savings Goal (calculations only, no persistence)
--   4. Cost Split (calculations only, no persistence)
--
-- Note: The Financial page currently only provides calculators.
-- Data can be saved to user_financial_data table for future use
-- or for Dashboard integration.
--
-- Dependencies:
--   - user_financial_data table (for storing financial data)
--   - RLS policies for secure access
--   - Indexes for optimal query performance
--   - Triggers for automatic updated_at timestamps
-- =============================================
-- Safe to run multiple times (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USER FINANCIAL DATA TABLE
-- =============================================
-- Stores financial data in JSONB format for flexibility
-- Supports: mahr, budget, savings, cost_split data types
-- Used by Dashboard for budget summary and recent activity

CREATE TABLE IF NOT EXISTS public.user_financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('mahr', 'budget', 'savings', 'cost_split')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. PERFORMANCE INDEXES
-- =============================================
-- Critical indexes for Financial page and Dashboard queries

-- Index for user lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_user_financial_data_user_id 
ON public.user_financial_data(user_id);

-- Index for data type filtering (used by Dashboard)
CREATE INDEX IF NOT EXISTS idx_user_financial_data_type 
ON public.user_financial_data(user_id, data_type);

-- Index for recent updates (for activity feed)
CREATE INDEX IF NOT EXISTS idx_user_financial_data_updated_at 
ON public.user_financial_data(user_id, updated_at DESC);

-- GIN index for JSONB data queries (for searching within data)
CREATE INDEX IF NOT EXISTS idx_user_financial_data_data_gin 
ON public.user_financial_data USING GIN (data);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on user_financial_data table
ALTER TABLE public.user_financial_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own financial data" ON public.user_financial_data;
DROP POLICY IF EXISTS "Users can insert own financial data" ON public.user_financial_data;
DROP POLICY IF EXISTS "Users can update own financial data" ON public.user_financial_data;
DROP POLICY IF EXISTS "Users can delete own financial data" ON public.user_financial_data;

-- Policy: Users can view their own financial data
CREATE POLICY "Users can view own financial data"
  ON public.user_financial_data FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own financial data
CREATE POLICY "Users can insert own financial data"
  ON public.user_financial_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own financial data
CREATE POLICY "Users can update own financial data"
  ON public.user_financial_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own financial data
CREATE POLICY "Users can delete own financial data"
  ON public.user_financial_data FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. AUTOMATIC UPDATED_AT TRIGGER
-- =============================================

-- Create function to update updated_at timestamp (in public schema for consistency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_financial_data_updated_at ON public.user_financial_data;

-- Create trigger to auto-update updated_at on financial data updates
CREATE TRIGGER update_user_financial_data_updated_at
  BEFORE UPDATE ON public.user_financial_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_financial_data TO authenticated;

-- =============================================
-- 6. VERIFICATION QUERIES
-- =============================================
-- Uncomment to verify the setup:

-- Check if table exists
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name = 'user_financial_data'
-- );

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name = 'user_financial_data'
-- ORDER BY ordinal_position;

-- Check indexes exist
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename = 'user_financial_data';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename = 'user_financial_data';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'user_financial_data';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The Financial page now has all required database structures:
--
-- ✅ user_financial_data table created (matching database.ts types)
-- ✅ Performance indexes for fast queries
-- ✅ RLS policies for secure access
-- ✅ Auto-update trigger for updated_at timestamp
-- ✅ GIN index for JSONB data queries
--
-- The Financial page currently provides calculators only:
--   - Mahr Calculator: Calculates suggested mahr range
--   - Wedding Budget: Plans wedding budget with category breakdown
--   - Savings Goal: Sets and tracks savings goals
--   - Cost Split: Manages cost splitting between families
--
-- Data can be saved to user_financial_data table with:
--   - data_type: 'mahr' | 'budget' | 'savings' | 'cost_split'
--   - data: JSONB object containing the financial data
--
-- Example data structures (from types/financial.ts):
--   - MahrData: { regionAverage, educationLevel, profession, yearsWorking, ... }
--   - WeddingBudgetData: { totalBudget, guestCount, venueType, categories, ... }
--   - SavingsGoalData: { targetAmount, currentSavings, monthlyIncome, ... }
--   - CostSplitData: { totalCost, brideContribution, groomContribution, ... }
--
-- The Dashboard page uses this table to display budget summaries
-- and track recent financial activity.
--
-- Next steps:
--   1. Run this migration in Supabase SQL Editor
--   2. Test the /dashboard/financial route
--   3. Verify calculators work correctly
--   4. (Optional) Add save functionality to persist calculations
--   5. Verify Dashboard can query financial data correctly
-- =============================================

