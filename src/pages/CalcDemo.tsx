import { useState, useEffect } from "react";
import { useFeaslyCalc } from "../hooks/useFeaslyCalc";
import { useConstructionStore } from "../hooks/useConstructionStore";

export default function CalcDemo() {
  const [qty, setQty] = useState(12_000_000);
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
  
  const { cash: row, kpi, interestRow } = useFeaslyCalc(items, 36);

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

      <table className="border mt-4">
        <thead><tr>
          {row.slice(0,36).map((_,i)=>
            <th key={i} className="border px-1 text-xs">P{i}</th>)}
        </tr></thead>
        <tbody><tr>
          {row.slice(0,36).map((v,i)=>
            <td key={i} className="border px-1 text-right text-xs">
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