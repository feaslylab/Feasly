-- Add currency_code field to projects table
ALTER TABLE public.projects 
ADD COLUMN currency_code TEXT DEFAULT 'AED';

-- Create exchange_rates table
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for exchange_rates table
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create policy for exchange_rates (public read access since it's reference data)
CREATE POLICY "Exchange rates are viewable by everyone" 
ON public.exchange_rates 
FOR SELECT 
USING (true);

-- Create unique index for currency pairs
CREATE UNIQUE INDEX idx_exchange_rates_currency_pair 
ON public.exchange_rates (from_currency, to_currency);

-- Insert seed data for exchange rates
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, updated_at) VALUES
('USD', 'AED', 3.67, now()),
('SAR', 'AED', 0.98, now()),
('QAR', 'AED', 1.01, now()),
('EUR', 'AED', 3.9, now()),
('GBP', 'AED', 4.3, now()),
('KWD', 'AED', 11.95, now()),
('BHD', 'AED', 9.74, now()),
('OMR', 'AED', 9.54, now()),
('EGP', 'AED', 0.12, now()),
('INR', 'AED', 0.045, now()),
('PKR', 'AED', 0.013, now()),
('CNY', 'AED', 0.51, now());