-- Clean up scenarios table and fix the user_id issue
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'user_id') THEN
        -- First add the column as nullable
        ALTER TABLE public.scenarios ADD COLUMN user_id UUID;
        
        -- Delete any existing rows since they don't have proper user_id values
        DELETE FROM public.scenarios WHERE user_id IS NULL;
        
        -- Now make it NOT NULL
        ALTER TABLE public.scenarios ALTER COLUMN user_id SET NOT NULL;
        
        RAISE NOTICE 'Added user_id column to scenarios table and cleaned up data';
    ELSE
        -- Column exists, but check if there are null values
        IF EXISTS (SELECT FROM public.scenarios WHERE user_id IS NULL) THEN
            -- Delete rows with null user_id
            DELETE FROM public.scenarios WHERE user_id IS NULL;
            RAISE NOTICE 'Cleaned up scenarios with null user_id values';
        END IF;
    END IF;
    
    -- Ensure RLS is enabled
    ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own scenarios" ON public.scenarios;
    DROP POLICY IF EXISTS "Users can create their own scenarios" ON public.scenarios;
    DROP POLICY IF EXISTS "Users can update their own scenarios" ON public.scenarios;
    DROP POLICY IF EXISTS "Users can delete their own scenarios" ON public.scenarios;
    
    -- Create RLS policies
    CREATE POLICY "Users can view their own scenarios" 
    ON public.scenarios 
    FOR SELECT 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own scenarios" 
    ON public.scenarios 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own scenarios" 
    ON public.scenarios 
    FOR UPDATE 
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own scenarios" 
    ON public.scenarios 
    FOR DELETE 
    USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Set up RLS policies for scenarios table';
END $$;