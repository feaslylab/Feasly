export interface RentalLine {
  rooms:            number;   // or leasable area m²
  adr:              number;   // Average Daily Rate (currency)
  occupancyRate:    number;   // 0-1
  startPeriod:      number;   // first month of operations
  endPeriod:        number;   // last month (inclusive)
  annualEscalation: number;   // 0.05 = 5 % CAGR
}

export function buildRentalRevenue(
  line: RentalLine,
  timeline: number
): number[] {
  if (line.endPeriod < line.startPeriod) throw new Error("end < start");
  const row = Array(timeline).fill(0);
  for (let p = line.startPeriod; p <= line.endPeriod; p++) {
    const years = (p - line.startPeriod) / 12;
    const adrEsc = line.adr * Math.pow(1 + line.annualEscalation, years);
    const monthly = adrEsc * line.occupancyRate * line.rooms * 30.4167;
    row[p] = +monthly.toFixed(2);
  }
  return row;
}