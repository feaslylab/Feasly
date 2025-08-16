import { useRevenueTotals } from "@/lib/engine/EngineContext";
import Decimal from "decimal.js";

export function RevenueHeadline() {
  const { rev_sales, rev_rent } = useRevenueTotals();

  const sum = (arr: any[]) =>
    arr.reduce((a: Decimal, b: Decimal) => a.plus(b), new Decimal(0));

  const totalSales = sum(rev_sales).toNumber();
  const totalRent  = sum(rev_rent).toNumber();

  return (
    <div className="flex gap-6 p-4 bg-card rounded-lg border">
      <div className="text-sm">
        <span className="text-muted-foreground">Total Sales:</span>
        <span className="ml-2 font-semibold">{totalSales.toLocaleString()}</span>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">Total Rent:</span>
        <span className="ml-2 font-semibold">{totalRent.toLocaleString()}</span>
      </div>
    </div>
  );
}