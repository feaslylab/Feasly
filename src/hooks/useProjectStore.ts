import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export function useProjectStore() {
  const [projects,setProjects] = useState<ProjectRow[]>([]);
  const [loading,setLoading]   = useState(true);

  useEffect(()=>{
    let ignore=false;
    supabase.from("projects")
      .select("*").order("created_at")
      .then(({data,error})=>{
        if(error) console.error(error);
        if(!ignore) { setProjects(data||[]); setLoading(false); }
      });
    return ()=>{ignore=true;};
  },[]);
  return { projects, loading };
}