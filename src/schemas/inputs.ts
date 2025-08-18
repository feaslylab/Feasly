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