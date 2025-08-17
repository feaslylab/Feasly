-- Phase 11B - Fix search_path for all SECURITY DEFINER functions
-- This prevents schema injection attacks

-- First, identify functions without search_path
DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
BEGIN
    FOR func_record IN 
        SELECT n.nspname as schema, p.proname as function_name, p.oid,
               pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.prosecdef = true
          AND NOT EXISTS (
            SELECT 1 FROM unnest(coalesce(p.proconfig, array[]::text[])) cfg
            WHERE cfg LIKE 'search_path=%'
          )
          AND n.nspname = 'public'
    LOOP
        func_signature := format('%I.%I(%s)', 
                                func_record.schema, 
                                func_record.function_name, 
                                func_record.args);
        
        -- Set search_path for each function
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp;', func_signature);
        
        RAISE NOTICE 'Fixed search_path for function: %', func_signature;
    END LOOP;
END$$;