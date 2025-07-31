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
    if(!projectId) { setKpi(null); return; }
    setLoad(true);
    supabase.from("kpi_snapshot")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at",{ascending:false})
      .limit(1)
      .then(({data,error})=>{
        if(error) {
          console.error(error);
          setKpi(null);
        } else {
          setKpi(data && data.length > 0 ? data[0] : null);
        }
        setLoad(false);
      });
  },[projectId,scenarioId]);

  return { kpi, loading };
}