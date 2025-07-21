-- Add VAT columns to feasly_cashflows table
ALTER TABLE public.feasly_cashflows 
ADD COLUMN vat_on_costs numeric DEFAULT 0,
ADD COLUMN vat_recoverable numeric DEFAULT 0;