import { useState, useEffect } from "react";
import { useFeaslyCalc } from "../hooks/useFeaslyCalc";
import { useConstructionStore } from "../hooks/useConstructionStore";
import { useScenarioStore } from "../hooks/useScenarioStore";
import { 
  useConstructionStoreScenario, 
  useSaleStore, 
  useRentalStore,
  constructionItemFromDB,
  saleLineFromDB,
  rentalLineFromDB,
  constructionItemToDB,
  saleLineToDB,
  rentalLineToDB
} from "../hooks/useTableStores";
import { SaleLine, RentalLine, LoanFacility } from "../../packages/feasly-engine/src";
import UploadEmdf from "@/components/UploadEmdf";

export default function Dashboard() {
  const projectId = 'demo-project';
  const [qty, setQty] = useState(12_000_000);
  const [useLoan, setUseLoan] = useState(false);
  
  // Scenario management
  const { scenarios, current, setCurrent, create } = useScenarioStore(projectId);
  
  // Scenario-aware stores
  const { items: constructionItems, save: saveConstructionItem, loading: constructionLoading } = useConstructionStoreScenario(projectId, current?.id || null);
  const { items: saleItems, save: saveSaleItem, loading: saleLoading } = useSaleStore(projectId, current?.id || null);
  const { items: rentalItems, save: saveRentalItem, loading: rentalLoading } = useRentalStore(projectId, current?.id || null);
  
  // Fallback for legacy construction store
  const { saveKPIs } = useConstructionStore();
  
  // Convert database items to engine format
  const items = constructionItems.length > 0 
    ? constructionItems.map(constructionItemFromDB)
    : [{
        baseCost: qty,
        startPeriod: 6,
        endPeriod: 24,
        escalationRate: 0.05,
        retentionPercent: 0.05,
        retentionReleaseLag: 2
      }];
  
  const revenueLines = saleItems.map(saleLineFromDB);
  const rentalLines = rentalItems.map(rentalLineFromDB);
  
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
    if (!constructionLoading && current) {
      saveKPIs({
        npv: kpi.npv,
        irr: kpi.projectIRR,
        profit: kpi.profit
      });
    }
  }, [kpi, saveKPIs, constructionLoading, current]);

  // Save new item when qty changes
  const handleQtyChange = async (newQty: number) => {
    setQty(newQty);
    if (constructionItems.length === 0 && current) {
      await saveConstructionItem(constructionItemToDB({
        baseCost: newQty,
        startPeriod: 6,
        endPeriod: 24,
        escalationRate: 0.05,
        retentionPercent: 0.05,
        retentionReleaseLag: 2
      }));
    }
  };

  // Add demo revenue line
  const addRevenue = async () => {
    if (!current) return;
    
    const newRevenueLine: SaleLine = {
      units: 80,
      pricePerUnit: 1_600_000,
      startPeriod: 24,
      endPeriod: 36,
      escalation: 0.04
    };
    
    await saveSaleItem(saleLineToDB(newRevenueLine));
  };

  // Add demo rental line
  const addRental = async () => {
    if (!current) return;
    
    const newRentalLine: RentalLine = {
      rooms: 150,
      adr: 800,
      occupancyRate: 0.68,
      startPeriod: 48,
      endPeriod: 60,
      annualEscalation: 0.05
    };
    
    await saveRentalItem(rentalLineToDB(newRentalLine));
  };

  if (constructionLoading || saleLoading || rentalLoading) {
    return <div className="p-6">Loading scenario data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Construction Cash-flow demo</h1>

      {/* Scenario Selector */}
      <div className="mb-4 p-4 bg-background border rounded-lg">
        <label className="block mb-2 font-medium">Select Scenario:</label>
        <div className="flex items-center gap-2">
          <select
            value={current?.id || ""}
            onChange={(e) => {
              const s = scenarios.find(x => x.id === e.target.value);
              setCurrent(s || null);
            }}
            className="border px-3 py-2 rounded mr-2 bg-background"
          >
            <option value="">No scenario selected</option>
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              const name = prompt("Scenario name:");
              if (name) create(name);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            + New scenario
          </button>
          
          <UploadEmdf onImportComplete={() => window.location.reload()} />
        </div>
        
        {current && (
          <p className="text-sm text-muted-foreground mt-2">
            Current scenario: <strong>{current.name}</strong>
          </p>
        )}
      </div>

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
        disabled={!current}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Revenue (80 units @ 1.6M AED, P24-36)
      </button>

      <button 
        onClick={addRental}
        disabled={!current}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
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