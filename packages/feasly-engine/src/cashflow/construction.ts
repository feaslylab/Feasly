import { z } from "zod";
import { expandCost } from "./evenSpread";

// schema
export const ConstructionItem = z.object({
  baseCost:            z.number().positive(),
  startPeriod:         z.number().int().nonnegative(),
  endPeriod:           z.number().int().nonnegative(),
  escalationRate:      z.number().nonnegative().default(0),
  retentionPercent:    z.number().min(0).max(1).default(0),
  retentionReleaseLag: z.number().int().nonnegative().default(0)
});
export type ConstructionItem = z.infer<typeof ConstructionItem>;

/** returns row length = timelineMonths */
export function buildConstructionRow(
  item: ConstructionItem,
  timelineMonths: number
): number[] {
  ConstructionItem.parse(item);
  // 1. even-spread escalated cost (no retention yet)
  const row = expandCost({
    amount: item.baseCost,
    startPeriod: item.startPeriod,
    endPeriod:   item.endPeriod,
    escalationRate: item.escalationRate
  }, timelineMonths);

  if (item.retentionPercent > 0) {
    // 2. split each period into payable + retained
    const retained = row.map(v => +(v * item.retentionPercent).toFixed(2));
    const payable  = row.map((v,i) => +(v - retained[i]).toFixed(2));
    // overwrite with payable
    for (let i=0;i<row.length;i++) row[i] = payable[i];
    // 3. release retained at lagged period after endPeriod
    const releasePeriod = item.endPeriod + item.retentionReleaseLag;
    if (releasePeriod >= row.length) {
      row.length = releasePeriod + 1;      // auto-extend
      row.fill(0, row.length - (releasePeriod + 1));
    }
    const totalRetained = +retained.reduce((a,b)=>a+b,0).toFixed(2);
    row[releasePeriod] += totalRetained;
  }
  return row;
}

