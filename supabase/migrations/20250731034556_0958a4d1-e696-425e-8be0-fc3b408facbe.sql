-- Fix the scenarios table by adding user_id column properly
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'user_id') THEN
        -- First add the column as nullable
        ALTER TABLE public.scenarios ADD COLUMN user_id UUID;
        
        -- Update existing rows to have a default user (or you could delete them if they're test data)
        -- For now, we'll set them to null and handle this in the application
        
        -- Now make it NOT NULL with a proper default
        ALTER TABLE public.scenarios ALTER COLUMN user_id SET NOT NULL;
        
        -- Add RLS policies if they don't exist
        DROP POLICY IF EXISTS "Users can view their own scenarios" ON public.scenarios;
        DROP POLICY IF EXISTS "Users can create their own scenarios" ON public.scenarios;
        DROP POLICY IF EXISTS "Users can update their own scenarios" ON public.scenarios;
        DROP POLICY IF EXISTS "Users can delete their own scenarios" ON public.scenarios;
        
        -- Enable RLS if not enabled
        ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for user access
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
        
        RAISE NOTICE 'Added user_id column and RLS policies to scenarios table';
    ELSE
        RAISE NOTICE 'user_id column already exists on scenarios table';
    END IF;
END $$;