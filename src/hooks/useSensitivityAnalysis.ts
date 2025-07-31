import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VariationInput {
  costVariationPercent: number;
  salePriceVariationPercent: number;
  interestRateVariationBps: number;
}

interface SensitivityResult {
  baseKpis: {
    npv: number;
    irr: number;
    profit: number;
  };
  variations: Array<{
    variation: VariationInput;
    kpis: {
      npv: number;
      irr: number;
      profit: number;
    };
    deltas: {
      npvDelta: number;
      irrDelta: number;
      profitDelta: number;
    };
  }>;
}

export function useSensitivityAnalysis(projectId: string | null, scenarioId: string | null) {
  const [result, setResult] = useState<SensitivityResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSensitivity = useCallback(async (variation: VariationInput) => {
    if (!projectId || !scenarioId) {
      setError('Project ID and Scenario ID are required');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Run multiple variations to create tornado chart data
      const variations = [
        { ...variation, costVariationPercent: -10 },
        { ...variation, costVariationPercent: 10 },
        { ...variation, salePriceVariationPercent: -10 },
        { ...variation, salePriceVariationPercent: 10 },
        { ...variation, interestRateVariationBps: -100 },
        { ...variation, interestRateVariationBps: 100 },
      ];

      // Get base scenario first
      const { data: baseData, error: baseError } = await supabase.functions.invoke('calculate', {
        body: { 
          projectId, 
          scenarioId,
          scenario: {
            constructionItems: [],
            saleLines: [],
            rentalLines: [],
            horizon: 60
          }
        }
      });

      if (baseError) throw baseError;

      // Run variations
      const variationResults = await Promise.all(
        variations.map(async (v) => {
          const { data, error } = await supabase.functions.invoke('calculate', {
            body: { 
              projectId, 
              scenarioId,
              scenario: {
                constructionItems: [],
                saleLines: [],
                rentalLines: [],
                horizon: 60
              },
              variation: v
            }
          });

          if (error) throw error;

          return {
            variation: v,
            kpis: data.kpis,
            deltas: {
              npvDelta: data.kpis.npv - baseData.kpis.npv,
              irrDelta: data.kpis.irr - baseData.kpis.irr,
              profitDelta: data.kpis.profit - baseData.kpis.profit,
            }
          };
        })
      );

      setResult({
        baseKpis: baseData.kpis,
        variations: variationResults
      });

    } catch (err) {
      console.error('Sensitivity analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [projectId, scenarioId]);

  return {
    result,
    isAnalyzing,
    error,
    runSensitivity
  };
}