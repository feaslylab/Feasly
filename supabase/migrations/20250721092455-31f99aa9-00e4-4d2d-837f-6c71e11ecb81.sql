-- Add escrow fields to feasly_cashflows table
ALTER TABLE public.feasly_cashflows 
ADD COLUMN escrow_reserved numeric DEFAULT 0,
ADD COLUMN escrow_released numeric DEFAULT 0;