-- Check if scenario_overrides exists and add missing columns
DO $$ 
BEGIN
    -- Add project_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'scenario_overrides' 
        AND column_name = 'project_id'
    ) THEN
        ALTER TABLE public.scenario_overrides ADD COLUMN project_id uuid NOT NULL;
    END IF;
    
    -- Add scenario column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'scenario_overrides' 
        AND column_name = 'scenario'
    ) THEN
        ALTER TABLE public.scenario_overrides ADD COLUMN scenario text NOT NULL DEFAULT 'base';
    END IF;
    
    -- Add field_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'scenario_overrides' 
        AND column_name = 'field_name'
    ) THEN
        ALTER TABLE public.scenario_overrides ADD COLUMN field_name text NOT NULL;
    END IF;
    
    -- Add override_text column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'scenario_overrides' 
        AND column_name = 'override_text'
    ) THEN
        ALTER TABLE public.scenario_overrides ADD COLUMN override_text text;
    END IF;
END $$;