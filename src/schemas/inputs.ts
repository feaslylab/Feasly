import { z } from "zod";

export const ProjectSchema = z.object({
  start_date: z.string().min(1, "Start date is required"),
  periods: z.number().int().positive("Periods must be a positive integer"),
  periodicity: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
});
export type ProjectInput = z.infer<typeof ProjectSchema>;

export const UnitTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  units: z.number().int().positive("Units must be > 0"),
  price: z.number().nonnegative("Price cannot be negative"),
  start_month: z.number().int().nonnegative().default(0),
  duration_months: z.number().int().positive().default(1),
});
export type UnitTypeInput = z.infer<typeof UnitTypeSchema>;

export const CostItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  start_month: z.number().int().nonnegative("Start month cannot be negative").default(0),
  duration_months: z.number().int().positive("Duration must be positive").default(1),
});
export type CostItemInput = z.infer<typeof CostItemSchema>;

export const DebtItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  interest_rate: z.number().min(0, "Interest rate cannot be negative").max(100, "Interest rate cannot exceed 100%"),
  start_month: z.number().int().nonnegative("Start month cannot be negative").default(0),
  term_months: z.number().int().positive("Term must be positive").default(12),
});
export type DebtItemInput = z.infer<typeof DebtItemSchema>;