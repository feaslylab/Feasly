-- Add AI summary and enhanced features to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_ai_summary TEXT;

-- Create table for tracking tag suggestions (optional for analytics)
CREATE TABLE IF NOT EXISTS project_tag_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  suggested_tag TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tag suggestions table
ALTER TABLE project_tag_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy for tag suggestions - users can only see suggestions for their projects
CREATE POLICY "Users can view tag suggestions for their projects" 
ON project_tag_suggestions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_tag_suggestions.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create tag suggestions for their projects" 
ON project_tag_suggestions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_tag_suggestions.project_id 
  AND projects.user_id = auth.uid()
));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_project_tag_suggestions_project_id ON project_tag_suggestions(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_ai_summary ON projects(project_ai_summary) WHERE project_ai_summary IS NOT NULL;