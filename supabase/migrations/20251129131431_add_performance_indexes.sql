-- Performance indexes for commonly queried tables
-- These indexes improve query performance for user-specific data

-- User checklist progress indexes
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user_id
  ON user_checklist_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_completed
  ON user_checklist_progress(user_id, is_completed)
  WHERE is_completed = true;

-- User module progress indexes
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id
  ON user_module_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_module_progress_completed
  ON user_module_progress(user_id, module_id, is_completed)
  WHERE is_completed = true;

-- User discussion notes indexes
CREATE INDEX IF NOT EXISTS idx_user_discussion_notes_user_id
  ON user_discussion_notes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_discussion_notes_discussed
  ON user_discussion_notes(user_id, is_discussed)
  WHERE is_discussed = true;

-- User financial data indexes
CREATE INDEX IF NOT EXISTS idx_user_financial_data_user_id
  ON user_financial_data(user_id, data_type);

-- Checklist items and categories
CREATE INDEX IF NOT EXISTS idx_checklist_items_category
  ON checklist_items(category_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_checklist_categories_sort
  ON checklist_categories(sort_order);

-- Modules and lessons
CREATE INDEX IF NOT EXISTS idx_modules_published
  ON modules(is_published, sort_order)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_lessons_module
  ON lessons(module_id, sort_order);

-- Resources
CREATE INDEX IF NOT EXISTS idx_resources_featured
  ON resources(is_featured, created_at DESC)
  WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_resources_type
  ON resources(content_type, created_at DESC);

-- User saved resources
CREATE INDEX IF NOT EXISTS idx_user_saved_resources_user
  ON user_saved_resources(user_id, created_at DESC);
