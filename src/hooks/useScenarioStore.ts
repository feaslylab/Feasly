import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

type Scenario = {
  id: string;
  project_id: string | null;
  name: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
};

type ScenarioInsert = {
  project_id: string;
  name: string;
  user_id: string;
};

export function useScenarioStore(projectId: string | null) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  // Return early if no projectId
  if (!projectId) {
    return { 
      scenarios: [], 
      current: null, 
      loading: false,
      setCurrent: () => {}, 
      create: async () => null,
      reload: () => {}
    };
  }

  const loadScenarios = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenarios' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setScenarios((data as unknown as Scenario[]) || []);
      
      // Set current to first scenario if none selected
      if (data && data.length > 0 && !current) {
        setCurrent(data[0] as unknown as Scenario);
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.id, current?.id]);

  const create = async (name: string): Promise<Scenario | null> => {
    if (!user) return null;

    try {
      const newScenario: ScenarioInsert = {
        project_id: projectId,
        name,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('scenarios' as any)
        .insert(newScenario)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newScenarioData = data as unknown as Scenario;
        setScenarios(prev => [...prev, newScenarioData]);
        
        // Clone items from current scenario if one exists
        if (current) {
          await cloneScenarioItems(current.id, newScenarioData.id);
        }
        
        setCurrent(newScenarioData);
        return newScenarioData;
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
    }
    
    return null;
  };

  const cloneScenarioItems = async (oldScenarioId: string, newScenarioId: string) => {
    if (!user) return;

    try {
      // Clone construction items
      const { data: constructionItems } = await supabase
        .from('construction_item' as any)
        .select('*')
        .eq('scenario_id', oldScenarioId)
        .eq('user_id', user.id);

      if (constructionItems && constructionItems.length > 0) {
        const newConstructionItems = (constructionItems as any[]).map((item: any) => ({
          project_id: item.project_id,
          user_id: item.user_id,
          scenario_id: newScenarioId,
          base_cost: item.base_cost,
          start_period: item.start_period,
          end_period: item.end_period,
          escalation_rate: item.escalation_rate,
          retention_percent: item.retention_percent,
          retention_release_lag: item.retention_release_lag,
        }));

        await supabase.from('construction_item' as any).insert(newConstructionItems);
      }

      // Clone revenue sale items
      const { data: saleItems } = await supabase
        .from('revenue_sale' as any)
        .select('*')
        .eq('scenario_id', oldScenarioId)
        .eq('user_id', user.id);

      if (saleItems && saleItems.length > 0) {
        const newSaleItems = (saleItems as any[]).map((item: any) => ({
          project_id: item.project_id,
          user_id: item.user_id,
          scenario_id: newScenarioId,
          units: item.units,
          price_per_unit: item.price_per_unit,
          start_period: item.start_period,
          end_period: item.end_period,
          escalation: item.escalation,
        }));

        await supabase.from('revenue_sale' as any).insert(newSaleItems);
      }

      // Clone revenue rental items
      const { data: rentalItems } = await supabase
        .from('revenue_rental' as any)
        .select('*')
        .eq('scenario_id', oldScenarioId)
        .eq('user_id', user.id);

      if (rentalItems && rentalItems.length > 0) {
        const newRentalItems = (rentalItems as any[]).map((item: any) => ({
          project_id: item.project_id,
          user_id: item.user_id,
          scenario_id: newScenarioId,
          rooms: item.rooms,
          adr: item.adr,
          occupancy_rate: item.occupancy_rate,
          start_period: item.start_period,
          end_period: item.end_period,
          annual_escalation: item.annual_escalation,
        }));

        await supabase.from('revenue_rental' as any).insert(newRentalItems);
      }
    } catch (error) {
      console.error('Error cloning scenario items:', error);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  return {
    scenarios,
    current,
    setCurrent,
    create,
    loading,
    reload: loadScenarios,
  };
}