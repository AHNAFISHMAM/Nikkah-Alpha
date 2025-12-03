-- =====================================================
-- INSERT SEED DATA ONLY
-- Run this AFTER creating tables
-- =====================================================

-- Insert Checklist Categories
INSERT INTO checklist_categories (id, name, description, icon, sort_order) VALUES
  ('cat_spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic foundation', '🤲', 1),
  ('cat_financial', 'Financial Planning', 'Ensure financial clarity and agreements', '💰', 2),
  ('cat_family', 'Family & Relationships', 'Build healthy family dynamics', '👨‍👩‍👧', 3),
  ('cat_personal', 'Personal Development', 'Grow individually for a stronger partnership', '🌱', 4),
  ('cat_future', 'Future Planning', 'Discuss and align on future goals', '🎯', 5);

-- Insert Checklist Items (31 total)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  -- Spiritual Preparation (6 items)
  ('cat_spiritual', 'Complete Islamic Marriage Course', 'Take a pre-marriage course from qualified scholars', true, 1),
  ('cat_spiritual', 'Study Rights & Responsibilities', 'Learn about spousal rights in Islam', true, 2),
  ('cat_spiritual', 'Discuss Religious Practice Level', 'Talk about prayer, fasting, and religious observances', true, 3),
  ('cat_spiritual', 'Learn Marriage Duas', 'Memorize important duas for marriage', false, 4),
  ('cat_spiritual', 'Seek Family Blessings', 'Get parental approval and blessings', true, 5),
  ('cat_spiritual', 'Perform Istikhara Prayer', 'Seek Allah''s guidance before proceeding', true, 6),

  -- Financial Planning (7 items)
  ('cat_financial', 'Agree on Mahr Amount', 'Discuss and finalize the mahr amount', true, 1),
  ('cat_financial', 'Disclose Financial Situation', 'Share income, debts, and savings information', true, 2),
  ('cat_financial', 'Create Wedding Budget', 'Plan a realistic wedding budget', true, 3),
  ('cat_financial', 'Discuss Financial Goals', 'Align on saving and spending habits', true, 4),
  ('cat_financial', 'Plan Living Arrangements', 'Decide on housing situation', true, 5),
  ('cat_financial', 'Set Up Banking Arrangements', 'Decide on joint or separate accounts', false, 6),
  ('cat_financial', 'Clarify Financial Responsibilities', 'Discuss who pays for what', true, 7),

  -- Family & Relationships (6 items)
  ('cat_family', 'Meet Both Families', 'Ensure families have met and connected', true, 1),
  ('cat_family', 'Discuss In-Law Boundaries', 'Establish healthy family boundaries', true, 2),
  ('cat_family', 'Plan Family Visit Frequency', 'Agree on family visit expectations', false, 3),
  ('cat_family', 'Discuss Children Timeline', 'Talk about when to have children', true, 4),
  ('cat_family', 'Align on Parenting Values', 'Discuss parenting approaches', true, 5),
  ('cat_family', 'Address Cultural Differences', 'Navigate cultural traditions', false, 6),

  -- Personal Development (6 items)
  ('cat_personal', 'Complete Health Check-Up', 'Get pre-marital health screening', true, 1),
  ('cat_personal', 'Discuss Communication Styles', 'Learn each other''s communication preferences', true, 2),
  ('cat_personal', 'Identify Conflict Resolution Strategy', 'Agree on handling disagreements', true, 3),
  ('cat_personal', 'Share Personal Goals', 'Discuss individual aspirations', true, 4),
  ('cat_personal', 'Discuss Lifestyle Preferences', 'Talk about daily routines and habits', false, 5),
  ('cat_personal', 'Learn Love Languages', 'Understand how to show and receive love', false, 6),

  -- Future Planning (6 items)
  ('cat_future', 'Discuss Career Ambitions', 'Share professional goals', true, 1),
  ('cat_future', 'Plan Living Location', 'Decide where to live long-term', true, 2),
  ('cat_future', 'Align on Work-Life Balance', 'Discuss work expectations', true, 3),
  ('cat_future', 'Set 5-Year Goals', 'Create shared vision for 5 years', false, 4),
  ('cat_future', 'Discuss Further Education', 'Talk about education plans', false, 5),
  ('cat_future', 'Plan for Emergencies', 'Discuss insurance and emergency funds', false, 6);

-- =====================================================
-- SUCCESS! Database now has:
-- ✅ 5 checklist categories
-- ✅ 31 checklist items
-- =====================================================
