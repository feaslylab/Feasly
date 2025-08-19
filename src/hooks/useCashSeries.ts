import { useFeaslyCalc }     from "@/hooks/useFeaslyCalc";
import { useSelectionStore } from "@/state/selectionStore";

export interface CashPoint {
  period : string;   // "P0"
  inflow : number;   // positive only
  outflow: number;   // positive only
  net    : number;   // signed
}

/** Returns 60-month stacked-area friendly series */
export function useCashSeries(): CashPoint[] {
  try {
    // For now, return sample data to prevent the chart error
    // TODO: Implement proper cash flow calculation once database schema is fixed
    const sampleCash = Array(60).fill(0).map((_, i) => {
      if (i < 12) return -100000; // Construction phase
      if (i >= 24 && i < 48) return 150000; // Sales phase
      return 0;
    });

    return sampleCash.map((v, i) => {
      // Ensure all numbers are finite and safe for charts
      const safeValue = Number.isFinite(v) ? v : 0;
      const inflow = safeValue > 0 ? safeValue : 0;
      const outflow = safeValue < 0 ? -safeValue : 0;
      
      return {
        period: `P${i}`,
        inflow: Number.isFinite(inflow) ? inflow : 0,
        outflow: Number.isFinite(outflow) ? outflow : 0,
        net: Number.isFinite(safeValue) ? safeValue : 0,
      };
    });
  } catch (error) {
    console.error('Error in useCashSeries:', error);
    // Return minimal safe data to prevent chart crash
    return [{
      period: 'P0',
      inflow: 0,
      outflow: 0,
      net: 0,
    }];
  }
}