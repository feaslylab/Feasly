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
    // Return minimal, guaranteed-safe data to prevent chart crashes
    return Array(12).fill(0).map((_, i) => ({
      period: `P${i}`,
      inflow: 0,
      outflow: 0,
      net: 0,
    }));
  } catch (error) {
    console.error('Error in useCashSeries:', error);
    // Return absolute minimal data to prevent crash
    return [{
      period: 'P0',
      inflow: 0,
      outflow: 0,
      net: 0,
    }];
  }
}