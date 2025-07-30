-- Create storage bucket for EMDF imports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('emdf_imports', 'emdf_imports', false);

-- Create RLS policy for user uploads
CREATE POLICY "Users can upload their own EMDF files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'emdf_imports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for users to read their own files
CREATE POLICY "Users can read their own EMDF files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'emdf_imports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policy for users to delete their own files
CREATE POLICY "Users can delete their own EMDF files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'emdf_imports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);