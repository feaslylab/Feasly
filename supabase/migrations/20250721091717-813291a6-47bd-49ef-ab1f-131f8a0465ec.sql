-- Add versioning fields to feasly_cashflows table
ALTER TABLE public.feasly_cashflows 
ADD COLUMN version_label text NOT NULL DEFAULT 'v1.0',
ADD COLUMN is_latest boolean NOT NULL DEFAULT true;

-- Create index for better performance when querying versions
CREATE INDEX idx_feasly_cashflows_project_version ON public.feasly_cashflows(project_id, is_latest);
CREATE INDEX idx_feasly_cashflows_project_label ON public.feasly_cashflows(project_id, version_label);