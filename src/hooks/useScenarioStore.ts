import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

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
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [current, setCurrent] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  const loadScenarios = useCallback(async () => {
    if (!user || !projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scenarios' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const scenarioData = (data as unknown as Scenario[]) || [];
      setScenarios(scenarioData);
      
      // Handle scenario selection logic
      if (scenarioData.length > 0) {
        // If current scenario no longer exists, reset to first available
        const currentExists = current && scenarioData.some(s => s.id === current.id);
        if (!currentExists) {
          setCurrent(scenarioData[0]);
        }
      } else {
        // No scenarios available, clear current
        setCurrent(null);
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId ?? '', user?.id ?? '', current?.id ?? '']);

  const reload = useCallback(async () => {
    await loadScenarios();
  }, [loadScenarios]);

  const create = useCallback(async (name: string): Promise<Scenario | null> => {
    if (!projectId || !user) return null;

    // 1. build row
    const row = {
      id: nanoid(),          // pk
      project_id: projectId,
      user_id: user.id,
      name,
      is_base: false,        // New scenarios are not base scenarios
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. insert
    const { data, error } = await supabase
      .from('scenarios')
      .insert(row)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error creating scenario',
        /* Bubble up exact SQL error for dev; generic for prod */
        description: import.meta.env.MODE === 'development'
          ? error.details || error.message
          : 'Could not create scenario – please try again.',
        variant: 'destructive',
      });
      return null;
    }

    // data is the actual DB row (with defaults/triggers). Use it.
    if (data) {
      const newScenario = data as unknown as Scenario;
      setScenarios(prev => [...prev, newScenario]);
      setCurrent(newScenario);
      return newScenario;
    }

    return null;
  }, [projectId ?? '', user?.id ?? '']);

  // ALL hooks must be called before any early returns
  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

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

  // Early return ONLY after all hooks are called
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

  return {
    scenarios,
    current,
    setCurrent,
    create,
    loading,
    reload,
  };
}