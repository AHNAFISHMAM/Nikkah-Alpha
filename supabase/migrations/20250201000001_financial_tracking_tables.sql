-- =============================================
-- Financial Tracking Tables Migration
-- =============================================
-- This migration creates dedicated tables for financial tracking:
--   1. budgets - Monthly budget tracker
--   2. mahr - Mahr tracker with payment status
--   3. wedding_budgets - Wedding budget planner
--   4. savings_goals - Savings goals tracker
--
-- These tables replace the generic user_financial_data JSONB approach
-- with structured, queryable tables for better performance and type safety.
-- =============================================
-- Safe to run multiple times (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. BUDGETS TABLE (Monthly Budget Tracker)
-- =============================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Income
  income_his DECIMAL(12, 2) NOT NULL DEFAULT 0,
  income_hers DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Fixed Expenses (6 categories)
  expense_housing DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_utilities DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_transportation DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_food DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_insurance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_debt DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Variable Expenses (5 categories)
  expense_entertainment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_dining DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_clothing DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_gifts DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_charity DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);

-- =============================================
-- 2. MAHR TABLE (Mahr Tracker)
-- =============================================
CREATE TABLE IF NOT EXISTS public.mahr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Partial')),
  deferred_schedule TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_mahr_user ON public.mahr(user_id);

-- =============================================
-- 3. WEDDING_BUDGETS TABLE (Wedding Budget Planner)
-- =============================================
CREATE TABLE IF NOT EXISTS public.wedding_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- 7 categories with planned and spent
  venue_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  venue_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  catering_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  catering_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  photography_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  photography_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  clothing_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  clothing_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  decor_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  decor_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invitations_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invitations_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_wedding_budgets_user ON public.wedding_budgets(user_id);

-- =============================================
-- 4. SAVINGS_GOALS TABLE (Savings Goals Tracker)
-- =============================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Pre-defined goals
  emergency_fund_goal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  emergency_fund_current DECIMAL(12, 2) NOT NULL DEFAULT 0,
  house_goal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  house_current DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Custom goal
  other_goal_name TEXT,
  other_goal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_goal_current DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

DROP POLICY IF EXISTS "Users can view own mahr" ON public.mahr;
DROP POLICY IF EXISTS "Users can insert own mahr" ON public.mahr;
DROP POLICY IF EXISTS "Users can update own mahr" ON public.mahr;
DROP POLICY IF EXISTS "Users can delete own mahr" ON public.mahr;

DROP POLICY IF EXISTS "Users can view own wedding_budgets" ON public.wedding_budgets;
DROP POLICY IF EXISTS "Users can insert own wedding_budgets" ON public.wedding_budgets;
DROP POLICY IF EXISTS "Users can update own wedding_budgets" ON public.wedding_budgets;
DROP POLICY IF EXISTS "Users can delete own wedding_budgets" ON public.wedding_budgets;

DROP POLICY IF EXISTS "Users can view own savings_goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can insert own savings_goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can update own savings_goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can delete own savings_goals" ON public.savings_goals;

-- Budgets policies
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Mahr policies
CREATE POLICY "Users can view own mahr"
  ON public.mahr FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mahr"
  ON public.mahr FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mahr"
  ON public.mahr FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mahr"
  ON public.mahr FOR DELETE
  USING (auth.uid() = user_id);

-- Wedding budgets policies
CREATE POLICY "Users can view own wedding_budgets"
  ON public.wedding_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wedding_budgets"
  ON public.wedding_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wedding_budgets"
  ON public.wedding_budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wedding_budgets"
  ON public.wedding_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Savings goals policies
CREATE POLICY "Users can view own savings_goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings_goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings_goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings_goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. AUTOMATIC UPDATED_AT TRIGGERS
-- =============================================

-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
DROP TRIGGER IF EXISTS update_mahr_updated_at ON public.mahr;
DROP TRIGGER IF EXISTS update_wedding_budgets_updated_at ON public.wedding_budgets;
DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON public.savings_goals;

-- Create triggers
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mahr_updated_at
  BEFORE UPDATE ON public.mahr
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wedding_budgets_updated_at
  BEFORE UPDATE ON public.wedding_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mahr TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_goals TO authenticated;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The Financial tracking tables are now ready:
--
-- ✅ budgets table created (monthly budget tracker)
-- ✅ mahr table created (mahr tracker with status)
-- ✅ wedding_budgets table created (wedding budget planner)
-- ✅ savings_goals table created (savings goals tracker)
-- ✅ Performance indexes for fast queries
-- ✅ RLS policies for secure access
-- ✅ Auto-update triggers for updated_at timestamps
--
-- Next steps:
--   1. Update TypeScript types in src/types/database.ts
--   2. Create React Query hooks for data fetching
--   3. Implement financial tracking components
-- =============================================

