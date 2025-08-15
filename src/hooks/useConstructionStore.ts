import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConstructionItem } from '@/lib/feasly-engine';
import { useAuth } from '@/components/auth/AuthProvider';
import { debounce } from 'lodash';

type DatabaseConstructionItem = {
  id: string;
  project_id: string;
  base_cost: number;
  start_period: number;
  end_period: number;
  escalation_rate: number;
  retention_percent: number;
  retention_release_lag: number;
  user_id: string;
  created_at: string;
};

type KPIData = {
  npv: number;
  irr: number | null;
  profit: number;
};

export function useConstructionStore(projectId: string = 'demo-project') {
  const { user } = useAuth();
  const [items, setItems] = useState<ConstructionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from database
  const loadItems = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('construction_item')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      const constructionItems: ConstructionItem[] = (data || []).map((item: DatabaseConstructionItem) => ({
        baseCost: item.base_cost,
        startPeriod: item.start_period,
        endPeriod: item.end_period,
        escalationRate: item.escalation_rate,
        retentionPercent: item.retention_percent,
        retentionReleaseLag: item.retention_release_lag,
      }));

      setItems(constructionItems);
    } catch (error) {
      console.error('Error loading construction items:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  // Save item to database
  const saveItem = useCallback(async (item: ConstructionItem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('construction_item')
        .insert({
          project_id: projectId,
          base_cost: item.baseCost,
          start_period: item.startPeriod,
          end_period: item.endPeriod,
          escalation_rate: item.escalationRate,
          retention_percent: item.retentionPercent,
          retention_release_lag: item.retentionReleaseLag,
          user_id: user.id,
        });

      if (error) throw error;
      
      // Reload items after saving
      await loadItems();
    } catch (error) {
      console.error('Error saving construction item:', error);
    }
  }, [projectId, user, loadItems]);

  // Save KPIs to database (debounced)
  const saveKPIs = useCallback(
    debounce(async (kpis: KPIData) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('kpi_snapshot')
          .insert({
            project_id: projectId,
            npv: kpis.npv,
            irr: kpis.irr,
            profit: kpis.profit,
            user_id: user.id,
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving KPI snapshot:', error);
      }
    }, 500),
    [projectId, user]
  );

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    saveItem,
    saveKPIs,
    loadItems,
  };
}