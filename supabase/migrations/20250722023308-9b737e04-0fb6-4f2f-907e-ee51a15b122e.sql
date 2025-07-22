-- Add missing fields to projects table for the Projects page

-- Create status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status project_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

-- Update existing projects to have default status
UPDATE projects SET status = 'active' WHERE status IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);