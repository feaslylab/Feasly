import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Benchmark {
  id: string;
  asset_type: string;
  avg_roi: number;
  avg_irr: number;
  avg_profit_margin: number;
  created_at: string;
  updated_at: string;
}

export function useBenchmarks() {
  const {
    data: benchmarks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['feasly-benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feasly_benchmarks')
        .select('*')
        .order('asset_type');

      if (error) {
        throw error;
      }

      return data as Benchmark[];
    },
  });

  const getBenchmarkByAssetType = (assetType: string): Benchmark | null => {
    return benchmarks?.find(b => 
      b.asset_type.toLowerCase() === assetType.toLowerCase()
    ) || null;
  };

  const calculateVariance = (
    actualValue: number, 
    benchmarkValue: number
  ): { 
    difference: number; 
    percentageDiff: number; 
    isAboveBenchmark: boolean;
  } => {
    const difference = actualValue - benchmarkValue;
    const percentageDiff = benchmarkValue !== 0 ? (difference / benchmarkValue) * 100 : 0;
    
    return {
      difference,
      percentageDiff,
      isAboveBenchmark: difference > 0,
    };
  };

  return {
    benchmarks: benchmarks || [],
    isLoading,
    error,
    getBenchmarkByAssetType,
    calculateVariance,
  };
}