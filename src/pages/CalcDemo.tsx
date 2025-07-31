import { useState, useEffect } from "react";
import { useFeaslyCalc } from "../hooks/useFeaslyCalc";
import { useConstructionStore } from "../hooks/useConstructionStore";
import { SaleLine, RentalLine, LoanFacility } from "../../packages/feasly-engine/src";

export default function CalcDemo() {
  const [qty, setQty] = useState(12_000_000);
  const [revenueLines, setRevenueLines] = useState<SaleLine[]>([]);
  const [rentalLines, setRentalLines] = useState<RentalLine[]>([]);
  const [useLoan, setUseLoan] = useState(false);
  const { items: storedItems, loading, saveItem, saveKPIs } = useConstructionStore();
  
  // Use stored items if available, otherwise use demo item
  const items = storedItems.length > 0 ? storedItems : [{
    baseCost: qty,
    startPeriod: 6,
    endPeriod: 24,
    escalationRate: 0.05,
    retentionPercent: 0.05,
    retentionReleaseLag: 2
  }];
  
  // Define loan facility
  const loanFacility: LoanFacility | undefined = useLoan ? {
    limit: 40_000_000,
    ltcPercent: 0.70,
    annualRate: 0.08,
    startPeriod: 6,
    maturityPeriod: 60,
    interestOnly: true
  } : undefined;
  
  const { cash: row, kpi, interestRow, loanRows } = useFeaslyCalc(items, 60, 0.10, revenueLines, rentalLines, loanFacility);

  // Save KPIs whenever they change
  useEffect(() => {
    if (!loading) {
      saveKPIs({
        npv: kpi.npv,
        irr: kpi.projectIRR,
        profit: kpi.profit
      });
    }
  }, [kpi, saveKPIs, loading]);

  // Save new item when qty changes
  const handleQtyChange = async (newQty: number) => {
    setQty(newQty);
    if (storedItems.length === 0) { // Only save if no stored items yet
      await saveItem({
        baseCost: newQty,
        startPeriod: 6,
        endPeriod: 24,
        escalationRate: 0.05,
        retentionPercent: 0.05,
        retentionReleaseLag: 2
      });
    }
  };

  // Add demo revenue line
  const addRevenue = () => {
    const newRevenueLine: SaleLine = {
      units: 80,
      pricePerUnit: 1_600_000,
      startPeriod: 24,
      endPeriod: 36,
      escalation: 0.04
    };
    setRevenueLines(prev => [...prev, newRevenueLine]);
  };

  // Add demo rental line
  const addRental = () => {
    const newRentalLine: RentalLine = {
      rooms: 150,
      adr: 800,
      occupancyRate: 0.68,
      startPeriod: 48,
      endPeriod: 60,
      annualEscalation: 0.05
    };
    setRentalLines(prev => [...prev, newRentalLine]);
  };

  if (loading) {
    return <div className="p-6">Loading construction data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Construction Cash-flow demo</h1>

      <label className="block mb-2">
        Base cost (AED):
        <input
          type="number" value={qty}
          onChange={e=>handleQtyChange(+e.target.value)}
          className="border ml-2 px-2"
        />
      </label>

      <button 
        onClick={addRevenue}
        className="bg-primary text-primary-foreground px-4 py-2 rounded mb-2 mr-2 hover:bg-primary/90 transition-colors"
      >
        Add Revenue (80 units @ 1.6M AED, P24-36)
      </button>

      <button 
        onClick={addRental}
        className="bg-emerald-600 text-emerald-50 px-4 py-2 rounded mb-4 hover:bg-emerald-700 transition-colors"
      >
        Add Rental (150 rooms, ADR 800, 68% occ, P48-60)
      </button>

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={useLoan}
          onChange={e => setUseLoan(e.target.checked)}
          className="mr-2"
        />
        Use loan 70% LTC @8% rate, bullet repay P60
      </label>

      {revenueLines.length > 0 && (
        <p className="text-sm text-gray-600 mb-1">
          Sale revenue lines: {revenueLines.length} (Total: {revenueLines.reduce((sum, line) => 
            sum + line.units * line.pricePerUnit, 0).toLocaleString()} AED)
        </p>
      )}

      {rentalLines.length > 0 && (
        <p className="text-sm text-gray-600 mb-2">
          Rental revenue lines: {rentalLines.length} (Avg monthly: {Math.round(
            rentalLines.reduce((sum, line) => 
              sum + line.adr * line.occupancyRate * line.rooms * 30.4167, 0)
          ).toLocaleString()} AED)
        </p>
      )}

      {useLoan && loanRows && (
        <p className="text-sm text-gray-600 mb-2">
          Peak Balance: {Math.max(...loanRows.balance).toLocaleString()} AED | 
          Total Interest: {loanRows.interest.reduce((sum, val) => sum + val, 0).toLocaleString()} AED
        </p>
      )}

      <table className="border mt-4 text-xs">
        <thead><tr>
          {row.slice(0,60).map((_,i)=>
            <th key={i} className="border px-1">P{i}</th>)}
        </tr></thead>
        <tbody><tr>
          {row.slice(0,60).map((v,i)=>
            <td key={i} className="border px-1 text-right">
              {v.toLocaleString(undefined,{maximumFractionDigits:0})}
            </td>)}
        </tr></tbody>
      </table>

      <p className="mt-4">
        <strong>NPV:</strong> {kpi.npv.toLocaleString(undefined,{maximumFractionDigits:0})} &nbsp;
        <strong>Profit:</strong> {kpi.profit.toLocaleString(undefined,{maximumFractionDigits:0})} &nbsp;
        <strong>IRR:</strong> {kpi.projectIRR !== null ? (kpi.projectIRR*100).toFixed(2)+' %' : '—'}
      </p>
      
      <p className="mt-2">
        <strong>Monthly Interest P0:</strong> {(-interestRow[0]).toLocaleString()}
      </p>
    </div>
  );
}