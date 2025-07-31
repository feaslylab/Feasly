import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface KpiRow {
  id: string;
  project_id: string;
  user_id: string;
  npv: number;
  irr: number | null;
  profit: number;
  created_at: string;
}

export function useKpiStore(projectId:string|null, scenarioId:string|null) {
  const [kpi,setKpi]       = useState<KpiRow|null>(null);
  const [loading,setLoad]  = useState(false);

  useEffect(()=>{
    if(!projectId || !scenarioId) { setKpi(null); return; }
    setLoad(true);
    supabase.from("kpi_snapshot")
      .select("*")
      .eq("project_id", projectId)
      .eq("scenario_id", scenarioId)
      .order("created_at",{ascending:false})
      .limit(1)
      .single()
      .then(({data,error})=>{
        if(error) {
          console.error(error);
          setKpi(null);
        } else {
          setKpi(data);
        }
        setLoad(false);
      });
  },[projectId,scenarioId]);

  return { kpi, loading };
}