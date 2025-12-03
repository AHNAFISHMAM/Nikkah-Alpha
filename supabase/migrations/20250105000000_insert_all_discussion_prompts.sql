-- =============================================
-- Insert All Discussion Prompts
-- =============================================
-- This migration adds all 16 discussion prompts
-- organized by category with proper order values
-- =============================================

-- Ensure order_index column exists (in case table was created with sort_order)
DO $$
BEGIN
  -- Check if order_index exists, if not, check for sort_order and rename it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'discussion_prompts' 
    AND column_name = 'order_index'
  ) THEN
    -- If sort_order exists, rename it to order_index
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'discussion_prompts' 
      AND column_name = 'sort_order'
    ) THEN
      ALTER TABLE public.discussion_prompts RENAME COLUMN sort_order TO order_index;
    ELSE
      -- If neither exists, add order_index
      ALTER TABLE public.discussion_prompts ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Clear existing prompts (optional - comment out if you want to keep existing ones)
-- DELETE FROM public.discussion_prompts;

-- Insert all discussion prompts
INSERT INTO public.discussion_prompts (title, description, category, order_index) VALUES

-- 1. Household Category
(
  'Daily Household Chores Division',
  'Discuss who will handle cooking, cleaning, laundry, grocery shopping, and other daily tasks. Consider work schedules, preferences, and fair distribution.',
  'Household',
  1
),

-- 2. Financial Category
(
  'Financial Management Style',
  'Will you have joint accounts, separate accounts, or both? Who will manage bill payments? How will you handle discretionary spending?',
  'Financial',
  2
),

-- 3. Living Category
(
  'Where Will We Live',
  'City, suburb, or rural? Near whose family? What type of home? Consider proximity to mosque, schools, work, and family.',
  'Living',
  3
),

-- 4. Family Planning Category
(
  'Children - When and How Many',
  'Do you want children? When to start trying? How many would you like? What if one wants more than the other? What about fertility challenges?',
  'Family Planning',
  4
),

-- 5. Communication Category
(
  'Handling Disagreements',
  'What will be our process when we disagree? How will we ensure fair resolution? What are absolute no-nos during arguments?',
  'Communication',
  5
),

-- 6. Career Category
(
  'Career and Education Goals',
  'What are your individual career aspirations? Will one or both work? How will you support each other''s goals? Plans for further education?',
  'Career',
  6
),

-- 7. Education Category
(
  'Islamic Education Priorities',
  'How important is Islamic education for you and your children? Weekend school, Islamic school, homeschool, or supplemental learning?',
  'Education',
  7
),

-- 8. Social Category
(
  'Social Life and Friendships',
  'How much time with friends vs. as a couple? Opposite gender friendships boundaries? Girls/guys nights out? Social media boundaries?',
  'Social',
  8
),

-- 9. Family Category
(
  'In-Laws Relationship Boundaries',
  'How often will you visit families? What if they want to visit or stay with you? How will you handle interfering in-laws? Living with parents?',
  'Family',
  9
),

-- 10. Financial Category (second prompt)
(
  'Spending on Extended Family',
  'Are you financially supporting parents or siblings? How much? Will this continue after marriage? How do you feel about this?',
  'Financial',
  10
),

-- 11. Parenting Category
(
  'Parenting Styles and Discipline',
  'What parenting approach do you prefer? How will you handle discipline? Who handles what in parenting? Unified front approach?',
  'Parenting',
  11
),

-- 12. Decision Making Category
(
  'Major Life Decisions Process',
  'How will you make big decisions like buying a house, changing careers, relocating? Will you use shura? Who has final say in what areas?',
  'Decision Making',
  12
),

-- 13. Health Category
(
  'Health and Lifestyle Choices',
  'Exercise routines? Dietary preferences? Health goals? How will you support each other''s health? What about mental health?',
  'Health',
  13
),

-- 14. Lifestyle Category
(
  'Technology and Screen Time',
  'How much time on phones, TV, gaming? Boundaries around device usage? Protect couple time? Social media sharing boundaries?',
  'Lifestyle',
  14
),

-- 15. Spiritual Category
(
  'Religious Practice and Growth',
  'Prayer habits? Quran study? Islamic lectures? Level of religious practice? How will you grow together spiritually?',
  'Spiritual',
  15
),

-- 16. Family Category (second prompt)
(
  'Holidays and Celebrations',
  'How will you split time between families on Eid? Birthday celebrations? Anniversaries? Cultural celebrations? Travel for holidays?',
  'Family',
  16
)

ON CONFLICT DO NOTHING;

-- =============================================
-- Verification
-- =============================================

-- Verify all prompts were inserted
DO $$
DECLARE
  prompt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO prompt_count FROM public.discussion_prompts;
  
  IF prompt_count < 16 THEN
    RAISE NOTICE 'Warning: Expected at least 16 prompts, but found %', prompt_count;
  ELSE
    RAISE NOTICE 'Success: % discussion prompts found in database', prompt_count;
  END IF;
END $$;

-- Display summary by category
SELECT 
  category,
  COUNT(*) as prompt_count,
  MIN(order_index) as min_order,
  MAX(order_index) as max_order
FROM public.discussion_prompts
GROUP BY category
ORDER BY category;
