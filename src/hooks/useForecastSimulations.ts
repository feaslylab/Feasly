import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ForecastDelta, ForecastResult } from "@/lib/forecast/engine";
import { useToast } from "@/hooks/use-toast";

interface ForecastSimulation {
  id: string;
  project_id: string;
  simulation_name: string;
  revenue_delta_percent: number;
  cost_delta_percent: number;
  delay_months: number;
  base_irr: number | null;
  base_roi: number | null;
  base_payback_period: number | null;
  forecasted_irr: number | null;
  forecasted_roi: number | null;
  forecasted_payback_period: number | null;
  simulation_data: any;
  created_at: string;
  updated_at: string;
}

export function useForecastSimulations(projectId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch simulations for project
  const {
    data: simulations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['forecast-simulations', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecast_simulations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching simulations:', error);
        throw error;
      }

      return data as ForecastSimulation[];
    },
    enabled: !!projectId
  });

  // Create simulation mutation
  const createSimulation = useMutation({
    mutationFn: async (params: {
      simulationName: string;
      delta: ForecastDelta;
      baseResult: any;
      forecastResult: ForecastResult;
    }) => {
      const { simulationName, delta, baseResult, forecastResult } = params;

      const { data, error } = await supabase
        .from('forecast_simulations')
        .insert({
          project_id: projectId,
          simulation_name: simulationName,
          revenue_delta_percent: delta.revenue_delta_percent,
          cost_delta_percent: delta.cost_delta_percent,
          delay_months: delta.delay_months,
          base_irr: baseResult.irr || null,
          base_roi: baseResult.roi || null,
          base_payback_period: baseResult.payback_period || null,
          forecasted_irr: forecastResult.irr || null,
          forecasted_roi: forecastResult.roi || null,
          forecasted_payback_period: forecastResult.payback_period || null,
          simulation_data: JSON.parse(JSON.stringify({
            base: baseResult,
            forecast: forecastResult,
            delta: delta
          }))
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating simulation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-simulations', projectId] });
      toast({
        title: "Simulation Created",
        description: "Forecast simulation has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error in simulation mutation:', error);
      toast({
        title: "Simulation Failed",
        description: "Could not save forecast simulation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete simulation mutation
  const deleteSimulation = useMutation({
    mutationFn: async (simulationId: string) => {
      const { error } = await supabase
        .from('forecast_simulations')
        .delete()
        .eq('id', simulationId);

      if (error) {
        console.error('Error deleting simulation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast-simulations', projectId] });
      toast({
        title: "Simulation Deleted",
        description: "Forecast simulation has been removed.",
      });
    },
    onError: (error) => {
      console.error('Error deleting simulation:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete simulation. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Run simulation
  const runSimulation = useCallback(async (
    simulationName: string,
    delta: ForecastDelta,
    baseResult: any,
    forecastResult: ForecastResult
  ) => {
    setIsSimulating(true);
    try {
      await createSimulation.mutateAsync({
        simulationName,
        delta,
        baseResult,
        forecastResult
      });
    } finally {
      setIsSimulating(false);
    }
  }, [createSimulation]);

  return {
    simulations: simulations || [],
    isLoading,
    error,
    refetch,
    runSimulation,
    isSimulating,
    deleteSimulation: deleteSimulation.mutate,
    isDeletingSimulation: deleteSimulation.isPending
  };
}