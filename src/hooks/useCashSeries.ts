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
  const { projectId, scenarioId } = useSelectionStore();

  // 🛈  Feasly hook already understands project/scenario and
  //     returns a complete cash[] row (positive = inflow, negative = cost)
  const { cash } = useFeaslyCalc(
    [],                    // constructionItems (store supplies in hook)
    60,                    // horizon
    0.10,                  // discount
    [],                    // revenueLines
    [],                    // rentalLines
    undefined              // loanFacility
  );

  return cash.map((v, i) => ({
    period : `P${i}`,
    inflow : v > 0 ?  v : 0,
    outflow: v < 0 ? -v : 0,
    net    : v,
  }));
}