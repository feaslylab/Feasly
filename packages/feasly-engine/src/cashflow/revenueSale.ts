export interface SaleLine {
  units:         number;  // ≥1
  pricePerUnit:  number;  // currency
  startPeriod:   number;  // P24
  endPeriod:     number;  // P36
  escalation:    number;  // 0.04 = 4 % p.a.
}

export function buildSaleRevenue(
  line: SaleLine,
  timeline: number
): number[] {
  if (line.endPeriod < line.startPeriod) throw new Error("end < start");
  const m  = line.endPeriod - line.startPeriod;
  const escalatedTotal =
    line.units * line.pricePerUnit * Math.pow(1 + line.escalation, m / 12);
  const per = escalatedTotal / (m + 1);

  const row = Array(timeline).fill(0);
  for (let t = line.startPeriod; t <= line.endPeriod; t++) {
    row[t] = +per.toFixed(2);
  }
  // rounding adjustment
  const diff =
    +(escalatedTotal - row.slice(line.startPeriod, line.endPeriod + 1)
                       .reduce((a,b)=>a+b,0)).toFixed(2);
  row[line.endPeriod] += diff;
  return row;
}

