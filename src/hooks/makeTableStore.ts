import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export function makeTableStore<T extends Record<string, any>>(tableName: string) {
  return function useTableStore(projectId: string, scenarioId: string | null) {
    const { user } = useAuth();
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
      if (!scenarioId || !user) {
        setItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(tableName as any)
          .select("*")
          .eq("project_id", projectId)
          .eq("scenario_id", scenarioId)
          .eq("user_id", user.id);
        
        if (error) throw error;
        setItems((data as unknown as T[]) || []);
      } catch (error) {
        console.error(`Error loading ${tableName}:`, error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, [projectId, scenarioId, user]);

    const save = async (row: any) => {
      if (!user || !scenarioId) return;
      
      try {
        const { data, error } = await supabase
          .from(tableName as any)
          .insert({
            ...row,
            project_id: projectId,
            scenario_id: scenarioId,
            user_id: user.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
          setItems((arr) => [...arr, data as unknown as T]);
        }
      } catch (error) {
        console.error(`Error saving to ${tableName}:`, error);
      }
    };

  const update = useCallback(async (id: string, patch: Partial<T>) => {
    if (!user || !projectId || !scenarioId) return;
    
    await supabase.from(tableName as any).update(patch).eq('id', id);
    setItems(arr => arr.map(r => 'id' in r && r.id === id ? {...r, ...patch} : r));
  }, [user, projectId, scenarioId, tableName]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, save, loading, reload: load, update };
};
}