-- Check if updated_at column exists and add it if missing
DO $$ 
BEGIN 
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'scenarios' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.scenarios 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        
        -- Create trigger for automatic timestamp updates if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'update_scenarios_updated_at'
        ) THEN
            CREATE TRIGGER update_scenarios_updated_at
            BEFORE UPDATE ON public.scenarios
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    END IF;
    
    -- Ensure RLS is enabled
    ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
END $$;