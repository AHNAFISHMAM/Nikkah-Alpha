-- =====================================================
-- ADD SEED DATA ONLY
-- This adds content without dropping existing tables
-- Safe to run on existing database
-- =====================================================

BEGIN;

-- =====================================================
-- 0. ENSURE CATEGORIES EXIST (creates if missing)
-- =====================================================

INSERT INTO checklist_categories (id, name, description, icon, sort_order)
SELECT * FROM (VALUES
  ('cat_spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic foundation', '🤲', 1),
  ('cat_financial', 'Financial Planning', 'Ensure financial clarity and agreements', '💰', 2),
  ('cat_family', 'Family & Relationships', 'Build healthy family dynamics', '👨‍👩‍👧', 3),
  ('cat_personal', 'Personal Development', 'Grow individually for a stronger partnership', '🌱', 4),
  ('cat_future', 'Future Planning', 'Discuss and align on future goals', '🎯', 5)
) AS v(id, name, description, icon, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_categories WHERE checklist_categories.id = v.id
);

-- =====================================================
-- 1. CHECKLIST ITEMS (31 items across 5 categories)
-- =====================================================

-- Spiritual Preparation (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order)
SELECT * FROM (VALUES
  ('cat_spiritual', 'Complete Islamic Marriage Course', 'Take a pre-marriage course from qualified scholars to understand Islamic marriage principles', true, 1),
  ('cat_spiritual', 'Study Rights & Responsibilities', 'Learn about the rights and responsibilities of spouses in Islam from authentic sources', true, 2),
  ('cat_spiritual', 'Discuss Religious Practice Level', 'Openly discuss your levels of prayer, fasting, hijab, and other religious observances', true, 3),
  ('cat_spiritual', 'Learn Marriage Duas', 'Memorize important duas for marriage, including the wedding night dua', false, 4),
  ('cat_spiritual', 'Seek Family Blessings', 'Get parental approval and blessings from both families', true, 5),
  ('cat_spiritual', 'Perform Istikhara Prayer', 'Pray Salat al-Istikhara seeking Allah''s guidance before proceeding', true, 6)
) AS v(category_id, title, description, is_required, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE checklist_items.category_id = v.category_id 
  AND checklist_items.title = v.title
);

-- Financial Planning (7 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order)
SELECT * FROM (VALUES
  ('cat_financial', 'Agree on Mahr Amount', 'Discuss and finalize the mahr (dowry) amount with transparency and fairness', true, 1),
  ('cat_financial', 'Disclose Financial Situation', 'Share complete information about income, debts, savings, and financial obligations', true, 2),
  ('cat_financial', 'Create Wedding Budget', 'Plan a realistic budget for the wedding ceremony that honors Islamic simplicity', true, 3),
  ('cat_financial', 'Discuss Financial Goals', 'Align on saving, investing, spending habits, and long-term financial objectives', true, 4),
  ('cat_financial', 'Plan Living Arrangements', 'Decide on housing situation, location, and whether to rent or buy', true, 5),
  ('cat_financial', 'Set Up Banking Arrangements', 'Decide on joint accounts, separate accounts, or a combination approach', false, 6),
  ('cat_financial', 'Clarify Financial Responsibilities', 'Discuss who will pay for what and how household expenses will be managed', true, 7)
) AS v(category_id, title, description, is_required, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE checklist_items.category_id = v.category_id 
  AND checklist_items.title = v.title
);

-- Family & Relationships (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order)
SELECT * FROM (VALUES
  ('cat_family', 'Meet Both Families', 'Ensure both families have met, connected, and built a relationship', true, 1),
  ('cat_family', 'Discuss In-Law Boundaries', 'Establish healthy boundaries with extended family while maintaining Islamic respect', true, 2),
  ('cat_family', 'Plan Family Visit Frequency', 'Agree on how often you''ll visit both families and expectations around holidays', false, 3),
  ('cat_family', 'Discuss Children Timeline', 'Talk openly about when or if you want to have children', true, 4),
  ('cat_family', 'Align on Parenting Values', 'Discuss parenting styles, discipline approaches, and children''s education plans', true, 5),
  ('cat_family', 'Address Cultural Differences', 'Navigate any cultural or family tradition differences with wisdom and compromise', false, 6)
) AS v(category_id, title, description, is_required, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE checklist_items.category_id = v.category_id 
  AND checklist_items.title = v.title
);

-- Personal Development (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order)
SELECT * FROM (VALUES
  ('cat_personal', 'Complete Health Check-Up', 'Get a comprehensive pre-marital health screening and share results honestly', true, 1),
  ('cat_personal', 'Discuss Communication Styles', 'Learn each other''s communication preferences and how you express emotions', true, 2),
  ('cat_personal', 'Identify Conflict Resolution Strategy', 'Agree on Islamic principles for handling disagreements and seeking mediation', true, 3),
  ('cat_personal', 'Share Personal Goals', 'Discuss individual aspirations, dreams, and how you''ll support each other', true, 4),
  ('cat_personal', 'Discuss Lifestyle Preferences', 'Talk about daily routines, hobbies, social life, and personal habits', false, 5),
  ('cat_personal', 'Learn Love Languages', 'Understand how you each prefer to give and receive love and affection', false, 6)
) AS v(category_id, title, description, is_required, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE checklist_items.category_id = v.category_id 
  AND checklist_items.title = v.title
);

-- Future Planning (6 items)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order)
SELECT * FROM (VALUES
  ('cat_future', 'Discuss Career Ambitions', 'Share professional goals and the support you''ll need from each other', true, 1),
  ('cat_future', 'Plan Living Location', 'Decide where you want to live long-term and factors that might require relocation', true, 2),
  ('cat_future', 'Align on Work-Life Balance', 'Discuss expectations about working outside the home for both spouses', true, 3),
  ('cat_future', 'Set 5-Year Goals', 'Create a shared vision for the next 5 years of your marriage', false, 4),
  ('cat_future', 'Discuss Further Education', 'Talk about plans for pursuing additional education or certifications', false, 5),
  ('cat_future', 'Plan for Emergencies', 'Discuss life insurance, wills, emergency funds, and estate planning', false, 6)
) AS v(category_id, title, description, is_required, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE checklist_items.category_id = v.category_id 
  AND checklist_items.title = v.title
);

COMMIT;

-- =====================================================
-- SUCCESS! Your checklist now has 31 items.
-- Refresh your app to see them!
-- =====================================================
