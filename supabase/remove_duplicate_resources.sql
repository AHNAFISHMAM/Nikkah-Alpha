-- Remove duplicate resources, keeping the oldest one (lowest created_at)
-- Removes duplicates based on (title, category) combination

DELETE FROM public.resources
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(TRIM(title)), category 
             ORDER BY created_at ASC, id ASC
           ) as rn
    FROM public.resources
  ) t
  WHERE t.rn > 1
);

-- Verify no duplicates remain
SELECT title, category, COUNT(*) as count 
FROM resources 
GROUP BY title, category 
HAVING COUNT(*) > 1;

-- Show final count and breakdown
SELECT COUNT(*) as total_resources FROM resources;
SELECT category, COUNT(*) as count FROM resources GROUP BY category ORDER BY category;

