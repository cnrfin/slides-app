-- Migration to add CASCADE DELETE constraints for slides and slide_elements
-- This ensures that when a lesson is deleted, all its slides are deleted
-- And when a slide is deleted, all its elements are deleted

-- Step 1: Drop existing foreign key constraints
ALTER TABLE slides 
DROP CONSTRAINT IF EXISTS slides_lesson_id_fkey;

ALTER TABLE slide_elements 
DROP CONSTRAINT IF EXISTS slide_elements_slide_id_fkey;

-- Step 2: Re-add foreign key constraints with CASCADE DELETE

-- When a lesson is deleted, delete all its slides
ALTER TABLE slides
ADD CONSTRAINT slides_lesson_id_fkey 
FOREIGN KEY (lesson_id) 
REFERENCES lessons(id) 
ON DELETE CASCADE;

-- When a slide is deleted, delete all its elements
ALTER TABLE slide_elements
ADD CONSTRAINT slide_elements_slide_id_fkey 
FOREIGN KEY (slide_id) 
REFERENCES slides(id) 
ON DELETE CASCADE;

-- Note: This migration assumes the following table structure:
-- - lessons table with id as primary key
-- - slides table with id as primary key and lesson_id as foreign key
-- - slide_elements table with id as primary key and slide_id as foreign key

-- To verify the constraints are properly set up:
-- SELECT 
--     tc.constraint_name, 
--     tc.table_name, 
--     kcu.column_name, 
--     ccu.table_name AS foreign_table_name,
--     ccu.column_name AS foreign_column_name,
--     rc.delete_rule
-- FROM 
--     information_schema.table_constraints AS tc 
--     JOIN information_schema.key_column_usage AS kcu
--       ON tc.constraint_name = kcu.constraint_name
--       AND tc.table_schema = kcu.table_schema
--     JOIN information_schema.constraint_column_usage AS ccu
--       ON ccu.constraint_name = tc.constraint_name
--       AND ccu.table_schema = tc.table_schema
--     JOIN information_schema.referential_constraints AS rc
--       ON rc.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('slides', 'slide_elements');
