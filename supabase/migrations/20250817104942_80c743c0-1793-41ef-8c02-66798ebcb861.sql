-- Phase 11A.2 & 11A.3 - Drop all permissive policies and create strict authenticated-only policies

-- First, drop all existing policies that use 'public' role
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE 'public' = ANY(roles)
          AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', 
                      pol_record.policyname, 
                      pol_record.schemaname, 
                      pol_record.tablename);
    END LOOP;
END$$;

-- Drop storage policies that use 'public' role
DO $$
DECLARE
    pol_record RECORD;
BEGIN
    FOR pol_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE 'public' = ANY(roles)
          AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', 
                      pol_record.policyname, 
                      pol_record.schemaname, 
                      pol_record.tablename);
    END LOOP;
END$$;