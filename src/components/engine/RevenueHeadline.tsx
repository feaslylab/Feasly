import { useEngineNumbers } from "@/lib/engine/EngineContext";
import { SafeChart } from "@/components/common/SafeChart";

export function RevenueHeadline() {
  const { revenue } = useEngineNumbers();
  const { rev_sales, rev_rent } = revenue;

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const totalSales = sum(rev_sales);
  const totalRent = sum(rev_rent);

  const hasData = (rev_sales?.length ?? 0) > 0 || (rev_rent?.length ?? 0) > 0;

  return (
    <SafeChart ready={hasData}>
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
    </SafeChart>
  );
}