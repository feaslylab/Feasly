import KpiCard from "./KpiCard";
import { useSelectionStore } from "@/state/selectionStore";
import { useKpiStore } from "@/hooks/useKpiStore";

function fmt(n:number|null|undefined, d=0){ // safe formatter
  if(n===null||n===undefined) return "—";
  return n.toLocaleString(undefined,{maximumFractionDigits:d});
}

export default function KpiGrid(){
  const { projectId, scenarioId } = useSelectionStore();
  const { kpi, loading }         = useKpiStore(projectId,scenarioId);

  if(!projectId||!scenarioId)
    return <p className="text-muted-foreground italic">
             Select a project & scenario to view KPIs
           </p>;

  if(loading)
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {Array.from({length:4}).map((_,i)=>(
               <div key={i} className="animate-pulse rounded-xl bg-muted/20 h-20"/>
             ))}
           </div>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="NPV (AED)"      value={fmt(kpi?.npv,0)} />
      <KpiCard label="IRR (%)"        value={kpi?.irr!==null&&kpi?.irr!==undefined?
                                            (kpi!.irr*100).toFixed(2):"—"} />
      <KpiCard label="Profit (AED)"   value={fmt(kpi?.profit,0)} />
      <KpiCard label="Updated"        value={kpi?
                                           new Date(kpi.created_at!).toLocaleDateString(): "—"} />
    </div>
  );
}