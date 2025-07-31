-- Create table for project drafts/autosave functionality
CREATE TABLE public.project_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  draft_data JSONB NOT NULL,
  etag TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own project drafts" 
ON public.project_drafts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project drafts" 
ON public.project_drafts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project drafts" 
ON public.project_drafts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project drafts" 
ON public.project_drafts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_project_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.etag = gen_random_uuid()::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp and etag updates
CREATE TRIGGER update_project_drafts_updated_at
  BEFORE UPDATE ON public.project_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_drafts_updated_at();

-- Create index for better performance
CREATE INDEX idx_project_drafts_project_user ON public.project_drafts(project_id, user_id);
CREATE INDEX idx_project_drafts_updated_at ON public.project_drafts(updated_at DESC);