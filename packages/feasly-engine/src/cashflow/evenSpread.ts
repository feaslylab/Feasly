import { z } from "zod";

// a) schema for a single cost item
export const CostItem = z.object({
  amount:         z.number().positive(),
  startPeriod:    z.number().int().nonnegative(),
  endPeriod:      z.number().int().nonnegative(),
  escalationRate: z.number().nonnegative().default(0)  // compound
});
export type CostItem = z.infer<typeof CostItem>;

// b) function to expand one cost item into a monthly array
export function expandCost(
  item: CostItem,
  timelineMonths: number
): number[] {
  CostItem.parse(item);
  if (item.endPeriod < item.startPeriod)
    throw new Error("endPeriod < startPeriod");

  const m = item.endPeriod - item.startPeriod;
  const escalated =
    item.amount * Math.pow(1 + item.escalationRate, m / 12);
  const per = escalated / (m + 1);

  const row = Array(timelineMonths).fill(0);
  for (let t = item.startPeriod; t <= item.endPeriod; t++) {
    row[t] = +per.toFixed(2);
  }
  // rounding remainder to last period
  const diff =
    +(escalated - row.slice(item.startPeriod, item.endPeriod + 1)
                     .reduce((a, b) => a + b, 0)).toFixed(2);
  row[item.endPeriod] += diff;
  return row;
}