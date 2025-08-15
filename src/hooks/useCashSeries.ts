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

    return sampleCash.map((v, i) => ({
      period : `P${i}`,
      inflow : v > 0 ?  v : 0,
      outflow: v < 0 ? -v : 0,
      net    : v,
    }));
  } catch (error) {
    console.error('Error in useCashSeries:', error);
    return [];
  }
}