import { useState, useEffect } from "react";
import { useFeaslyCalc } from "../hooks/useFeaslyCalc";
import { useConstructionStore } from "../hooks/useConstructionStore";
import { SaleLine, RentalLine, LoanFacility } from "@/lib/feasly-engine";

export default function CalcDemo() {
  const [qty, setQty] = useState(12_000_000);
  const [revenueLines, setRevenueLines] = useState<SaleLine[]>([]);
  const [rentalLines, setRentalLines] = useState<RentalLine[]>([]);
  const [useLoan, setUseLoan] = useState(false);

  const { items } = useConstructionStore();

  const loanFacility: LoanFacility = {
    maxAmount: 800_000,
    interestRate: 0.08,
    termMonths: 12,
    limit: 800_000,
    ltcPercent: 0.8,
    annualRate: 0.08,
    startPeriod: 1,
    maturityPeriod: 36,
    interestOnly: true
  };

  const { cash, kpi } = useFeaslyCalc(
    [
      {
        baseCost: qty,
        startPeriod: 0,
        endPeriod: 10,
        escalationRate: 0,
        retentionPercent: 0,
        retentionReleaseLag: 0,
      },
    ],
    60,
    0.10,
    revenueLines,
    rentalLines,
    useLoan ? loanFacility : undefined
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Calculation Demo</h1>
        <p className="text-muted-foreground">
          This demo shows live recalculation of financial models using the feasly engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Construction Cost</h2>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="Enter cost in AED"
          />
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useLoan}
                onChange={(e) => setUseLoan(e.target.checked)}
              />
              <span>Use loan facility</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Key Performance Indicators</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">NPV</div>
              <div className="text-lg font-semibold">
                {kpi.npv.toLocaleString()} AED
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">IRR</div>
              <div className="text-lg font-semibold">{kpi.projectIRR}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Total Profit</div>
              <div className="text-lg font-semibold">
                {kpi.profit.toLocaleString()} AED
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Cash Flow Preview</h2>
          <div className="h-40 overflow-y-auto space-y-1">
            {cash.slice(0, 12).map((amount, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>Month {i + 1}:</span>
                <span className={amount >= 0 ? "text-green-600" : "text-red-600"}>
                  {amount.toLocaleString()} AED
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}