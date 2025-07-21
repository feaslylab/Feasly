-- Create feasly_benchmarks table for KPI benchmarking
CREATE TABLE public.feasly_benchmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type text NOT NULL UNIQUE,
  avg_roi numeric NOT NULL,
  avg_irr numeric NOT NULL,
  avg_profit_margin numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feasly_benchmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for benchmark access
CREATE POLICY "Benchmarks are viewable by everyone" 
ON public.feasly_benchmarks 
FOR SELECT 
USING (true);

-- Insert hardcoded benchmark entries
INSERT INTO public.feasly_benchmarks (asset_type, avg_roi, avg_irr, avg_profit_margin) VALUES
  ('Residential', 15.5, 18.2, 22.5),
  ('Commercial', 12.8, 16.5, 18.3),
  ('Retail', 14.2, 17.1, 20.8),
  ('Mixed Use', 13.9, 17.8, 21.2),
  ('Hospitality', 11.5, 15.3, 16.9),
  ('Office', 10.8, 14.7, 15.4),
  ('Industrial', 9.2, 13.1, 12.8),
  ('Healthcare', 8.9, 12.5, 14.6);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feasly_benchmarks_updated_at
BEFORE UPDATE ON public.feasly_benchmarks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();