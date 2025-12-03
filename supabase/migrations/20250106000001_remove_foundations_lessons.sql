-- =============================================
-- Remove Specific Lessons from Module 1
-- =============================================
-- This migration removes the following lessons from
-- the Islamic Marriage Foundations module:
-- 1. The Purpose of Marriage in Islam
-- 2. Rights of the Wife
-- 3. Rights of the Husband
-- 4. The Wedding (Nikah) Process
-- 5. Prophetic Guidance on Marriage
-- =============================================

-- Delete the specified lessons
DELETE FROM public.lessons
WHERE module_id = 'mod_foundations'
  AND title IN (
    'The Purpose of Marriage in Islam',
    'Rights of the Wife',
    'Rights of the Husband',
    'The Wedding (Nikah) Process',
    'Prophetic Guidance on Marriage'
  );

-- Verify deletion
-- Run this query to confirm the lessons were removed:
-- SELECT id, title, sort_order 
-- FROM public.lessons 
-- WHERE module_id = 'mod_foundations' 
-- ORDER BY sort_order;

