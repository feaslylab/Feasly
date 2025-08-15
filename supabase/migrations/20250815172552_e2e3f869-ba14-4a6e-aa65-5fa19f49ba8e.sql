-- Fix the final database schema issues to match TypeScript types

-- Fix asset_type vs type field name issue
ALTER TABLE public.assets 
RENAME COLUMN asset_type TO type;