-- Check if scenarios table exists and create it if needed
DO $$
BEGIN
    -- Check if scenarios table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scenarios') THEN
        -- Create scenarios table
        CREATE TABLE public.scenarios (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            project_id UUID NOT NULL,
            user_id UUID NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable Row Level Security
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

        -- Create trigger for automatic timestamp updates
        CREATE TRIGGER update_scenarios_updated_at
        BEFORE UPDATE ON public.scenarios
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

        RAISE NOTICE 'Created scenarios table with RLS policies';
    ELSE
        -- Table exists, check if user_id column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'user_id') THEN
            ALTER TABLE public.scenarios ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();
            RAISE NOTICE 'Added user_id column to existing scenarios table';
        END IF;
    END IF;
END $$;