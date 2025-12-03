-- =============================================
-- Reset Checklist to Exact Specification
-- =============================================
-- Removes ALL existing checklist data and inserts
-- only the exact categories and items from spec
-- No duplicates, no extra items
-- =============================================

-- Ensure tables exist (create if they don't)
CREATE TABLE IF NOT EXISTS public.checklist_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT NOT NULL REFERENCES public.checklist_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_checklist_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  discuss_with_partner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Step 1: Delete ALL existing data
TRUNCATE TABLE public.user_checklist_progress CASCADE;
TRUNCATE TABLE public.checklist_items CASCADE;
TRUNCATE TABLE public.checklist_categories CASCADE;

-- Step 2: Insert exact categories from specification
INSERT INTO public.checklist_categories (id, name, description, icon, sort_order) VALUES
  ('spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic knowledge together', '🤲', 1),
  ('financial', 'Financial Preparation', 'Plan your financial future as a couple', '💰', 2),
  ('family', 'Family & Social', 'Navigate family relationships and social expectations', '👨‍👩‍👧', 3),
  ('personal', 'Personal Development', 'Grow individually and as a couple', '🌱', 4),
  ('future', 'Future Planning', 'Set goals and plan for your life together', '🎯', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Step 3: Delete ALL existing items (in case some remain)
DELETE FROM public.checklist_items;

-- Step 4: Insert exact items from specification
-- A) Spiritual Preparation (5 items)
INSERT INTO public.checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('spiritual', 'Islamic marriage rights/roles', 'Understand the rights and duties of spouses in Islam', false, 1),
  ('spiritual', 'Intimacy rulings', 'Learn about halal intimacy, family planning from Islamic perspective', false, 2),
  ('spiritual', 'Prayer & worship habits', 'Share and align on daily prayers, Quran reading, and dhikr routines', false, 3),
  ('spiritual', 'Quranic knowledge about marriage', 'Read and reflect on verses about love, mercy, and partnership', false, 4),
  ('spiritual', 'Understanding spouse rights in Islam', 'Learn about mutual respect, kindness, and Islamic boundaries', false, 5);

-- B) Financial Preparation (6 items)
INSERT INTO public.checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('financial', 'Mahr (dowry) agreement', 'Discuss and finalize the mahr (dowry) according to Islamic principles', false, 1),
  ('financial', 'Housing plan', 'Decide where to live and calculate housing costs', false, 2),
  ('financial', 'Monthly expense planning', 'Create a realistic monthly budget covering all expenses', false, 3),
  ('financial', 'Debt disclosure', 'Be transparent about any debts and create repayment plan', false, 4),
  ('financial', 'Emergency fund goals', 'Plan to save 3-6 months of expenses for emergencies', false, 5),
  ('financial', 'Career stability assessment', 'Discuss job security, career goals, and income expectations', false, 6);

-- C) Family & Social (5 items)
INSERT INTO public.checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('family', 'Wali involvement/approval', 'Ensure proper Islamic process with guardian involvement', false, 1),
  ('family', 'Family introductions', 'Both families should meet and get to know each other', false, 2),
  ('family', 'Cultural expectations', 'Talk about cultural practices, traditions, and boundaries', false, 3),
  ('family', 'Living arrangements', 'Clarify if living independently, with family, or other arrangement', false, 4),
  ('family', 'In-laws expectations', 'Discuss healthy relationships with extended family', false, 5);

-- D) Personal Development (6 items)
INSERT INTO public.checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('personal', 'Anger management', 'Learn to control anger and communicate calmly', false, 1),
  ('personal', 'Communication skills', 'Learn healthy ways to disagree and resolve issues', false, 2),
  ('personal', 'Household responsibilities', 'Talk about cooking, cleaning, and home management', false, 3),
  ('personal', 'Daily routines', 'Understand each other''s schedules, sleep patterns, and preferences', false, 4),
  ('personal', 'Health & fitness goals', 'Discuss healthy lifestyle, exercise, and wellness plans', false, 5),
  ('personal', 'Mental health check', 'Be open about mental health history and support needs', false, 6);

-- E) Future Planning (5 items)
INSERT INTO public.checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('future', 'Children: when, how many', 'Talk about when/if to have children and family size preferences', false, 1),
  ('future', 'Career/education goals', 'Share individual goals and how to support each other', false, 2),
  ('future', 'Long-term living plans', 'Discuss where you want to live in 5-10 years', false, 3),
  ('future', '5-year financial goals', 'Plan for major purchases, savings, investments', false, 4),
  ('future', 'Islamic education priorities', 'Discuss Islamic school, homeschooling, or weekend programs', false, 5);

-- =============================================
-- VERIFICATION
-- =============================================
-- Verify exact counts (should match spec):
-- Spiritual: 5 items
-- Financial: 6 items
-- Family: 5 items
-- Personal: 6 items
-- Future: 5 items
-- Total: 27 items, 5 categories
-- =============================================

