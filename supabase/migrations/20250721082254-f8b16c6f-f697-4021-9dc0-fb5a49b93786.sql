-- Create table for storing feasly cashflow data
CREATE TABLE public.feasly_cashflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  scenario TEXT NOT NULL CHECK (scenario IN ('base', 'optimistic', 'pessimistic', 'custom')),
  month TEXT NOT NULL,
  construction_cost NUMERIC DEFAULT 0,
  land_cost NUMERIC DEFAULT 0,
  soft_costs NUMERIC DEFAULT 0,
  loan_drawn NUMERIC DEFAULT 0,
  loan_interest NUMERIC DEFAULT 0,
  loan_repayment NUMERIC DEFAULT 0,
  equity_injected NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  net_cashflow NUMERIC DEFAULT 0,
  cash_balance NUMERIC DEFAULT 0,
  zakat_due NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feasly_cashflows ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can access cashflows for their projects" 
ON public.feasly_cashflows 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_cashflows.project_id 
  AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = feasly_cashflows.project_id 
  AND projects.user_id = auth.uid()
));

-- Create index for performance
CREATE INDEX idx_feasly_cashflows_project_scenario ON public.feasly_cashflows(project_id, scenario);
CREATE INDEX idx_feasly_cashflows_month ON public.feasly_cashflows(month);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feasly_cashflows_updated_at
BEFORE UPDATE ON public.feasly_cashflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();