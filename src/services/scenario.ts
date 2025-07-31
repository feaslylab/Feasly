import { supabase } from "@/integrations/supabase/client";

export interface ScenarioInput {
  constructionItems: Array<{
    baseCost: number;
    startPeriod: number;
    endPeriod: number;
    escalationRate?: number;
    retentionPercent?: number;
    retentionReleaseLag?: number;
  }>;
  saleLines: Array<{
    units: number;
    pricePerUnit: number;
    startPeriod: number;
    endPeriod: number;
    escalation?: number;
  }>;
  rentalLines: Array<{
    rooms: number;
    adr: number;
    occupancyRate: number;
    startPeriod: number;
    endPeriod: number;
    annualEscalation?: number;
  }>;
  horizon?: number;
}

export interface ScenarioResult {
  cashflow: number[];
  kpis: {
    npv: number;
    irr: number;
    profit: number;
    totalRevenue: number;
    totalCosts: number;
  };
  updatedAt: string;
}

export async function recalculateScenario(
  projectId: string, 
  scenarioId: string,
  scenario: ScenarioInput
): Promise<ScenarioResult> {
  console.log('Recalculating scenario:', { projectId, scenarioId });
  
  try {
    const { data, error } = await supabase.functions.invoke('calculate', {
      body: { projectId, scenarioId, scenario }
    });
    
    if (error) {
      console.error('Error calling calculate function:', error);
      throw error;
    }
    
    console.log('Scenario calculation completed:', data);
    return data as ScenarioResult;
    
  } catch (error) {
    console.error('Failed to recalculate scenario:', error);
    throw error;
  }
}

export async function getCachedScenarioResult(
  projectId: string,
  scenarioId: string
): Promise<ScenarioResult | null> {
  try {
    const { data, error } = await supabase
      .from('scenario_results')
      .select('result')
      .eq('project_id', projectId)
      .eq('scenario_id', scenarioId)
      .single();
    
    if (error || !data) {
      console.log('No cached result found for scenario:', scenarioId);
      return null;
    }
    
    return data.result as unknown as ScenarioResult;
    
  } catch (error) {
    console.error('Error fetching cached scenario result:', error);
    return null;
  }
}