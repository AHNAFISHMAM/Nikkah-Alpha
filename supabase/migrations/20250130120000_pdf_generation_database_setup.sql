-- =============================================
-- PDF Tables Cleanup Migration
-- =============================================
-- This migration removes all PDF-related database tables
-- since PDF generation is handled entirely client-side
-- and doesn't require database storage.
--
-- Related Files:
--   - src/lib/modulePdf.ts (PDF generation function - no DB needed)
--   - src/pages/public/ModuleDetail.tsx (PDF download trigger)
-- =============================================

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS trigger_update_user_pdf_preferences_updated_at ON public.user_pdf_preferences;
DROP TRIGGER IF EXISTS trigger_update_pdf_layout_config_updated_at ON public.pdf_layout_config;

-- Drop helper functions (they reference the tables)
DROP FUNCTION IF EXISTS get_user_pdf_preferences(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_active_pdf_layout_config() CASCADE;

-- Drop trigger functions (after triggers are dropped)
DROP FUNCTION IF EXISTS update_user_pdf_preferences_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_pdf_layout_config_updated_at() CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "users: update own pdf_preferences" ON public.user_pdf_preferences;
DROP POLICY IF EXISTS "users: insert own pdf_preferences" ON public.user_pdf_preferences;
DROP POLICY IF EXISTS "users: select own pdf_preferences" ON public.user_pdf_preferences;
DROP POLICY IF EXISTS "service_role: manage pdf_layout_config" ON public.pdf_layout_config;
DROP POLICY IF EXISTS "users: select pdf_layout_config" ON public.pdf_layout_config;
DROP POLICY IF EXISTS "users: insert own pdf_history" ON public.pdf_generation_history;
DROP POLICY IF EXISTS "users: select own pdf_history" ON public.pdf_generation_history;

-- Drop tables (CASCADE will drop dependent objects like indexes)
DROP TABLE IF EXISTS public.user_pdf_preferences CASCADE;
DROP TABLE IF EXISTS public.pdf_layout_config CASCADE;
DROP TABLE IF EXISTS public.pdf_generation_history CASCADE;

-- =============================================
-- END OF MIGRATION
-- =============================================
-- Note: PDF generation works entirely client-side
-- using jsPDF library. No database storage needed.
