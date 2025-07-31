import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

// Import engine utilities
interface VariationInput {
  costVariationPercent: number;
  salePriceVariationPercent: number;
  interestRateVariationBps: number;
}

function applyVariation(scenario: any, variation: VariationInput) {
  const { costVariationPercent, salePriceVariationPercent, interestRateVariationBps } = variation;
  
  return {
    ...scenario,
    constructionItems: scenario.constructionItems.map((item: any) => ({
      ...item,
      baseCost: item.baseCost * (1 + costVariationPercent / 100)
    })),
    saleLines: scenario.saleLines.map((line: any) => ({
      ...line,
      pricePerUnit: line.pricePerUnit * (1 + salePriceVariationPercent / 100)
    })),
    loanFacility: scenario.loanFacility ? {
      ...scenario.loanFacility,
      interestRate: scenario.loanFacility.interestRate + (interestRateVariationBps / 10000)
    } : undefined
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple calculation engine function - mimics feasly-engine functionality
function runScenario(scenario: any) {
  console.log('Running scenario calculation:', scenario);
  
  // Basic calculation simulation
  const { constructionItems = [], saleLines = [], rentalLines = [], horizon = 60 } = scenario;
  
  const cashflow = Array(horizon).fill(0);
  
  // Add construction costs (negative)
  constructionItems.forEach((item: any) => {
    for (let i = item.startPeriod; i <= item.endPeriod && i < horizon; i++) {
      cashflow[i] -= item.baseCost / (item.endPeriod - item.startPeriod + 1);
    }
  });
  
  // Add sale revenue (positive)
  saleLines.forEach((sale: any) => {
    for (let i = sale.startPeriod; i <= sale.endPeriod && i < horizon; i++) {
      cashflow[i] += (sale.units * sale.pricePerUnit) / (sale.endPeriod - sale.startPeriod + 1);
    }
  });
  
  // Add rental revenue (positive)
  rentalLines.forEach((rental: any) => {
    for (let i = rental.startPeriod; i <= rental.endPeriod && i < horizon; i++) {
      const monthlyRevenue = (rental.rooms * rental.adr * rental.occupancyRate * 30) / 100;
      cashflow[i] += monthlyRevenue;
    }
  });
  
  // Calculate KPIs with enhanced metrics
  const totalCashflow = cashflow.reduce((sum, val) => sum + val, 0);
  const npv = cashflow.reduce((acc, cf, i) => acc + cf / Math.pow(1.1, i / 12), 0);
  const projectIRR = totalCashflow > 0 ? 0.15 : -0.05; // Simplified IRR calculation
  
  // Enhanced KPI calculations
  const totalInflow = cashflow.filter(cf => cf > 0).reduce((sum, cf) => sum + cf, 0);
  const totalOutflow = Math.abs(cashflow.filter(cf => cf < 0).reduce((sum, cf) => sum + cf, 0));
  const equityMultiple = totalOutflow > 0 ? totalInflow / totalOutflow : 0;
  
  // Payback period calculation
  let cumulativeCF = 0;
  let paybackMonths = null;
  for (let i = 0; i < cashflow.length; i++) {
    cumulativeCF += cashflow[i];
    if (cumulativeCF > 0 && paybackMonths === null) {
      paybackMonths = i;
      break;
    }
  }
  
  // Peak funding requirement
  let cumulativeForPeak = 0;
  let peakFunding = 0;
  for (const cf of cashflow) {
    cumulativeForPeak += cf;
    if (cumulativeForPeak < peakFunding) {
      peakFunding = cumulativeForPeak;
    }
  }
  peakFunding = Math.abs(peakFunding);
  
  return {
    cashflow,
    kpis: {
      npv,
      projectIRR,
      profit: totalCashflow,
      equityMultiple,
      paybackMonths,
      peakFunding,
      totalRevenue: cashflow.filter(v => v > 0).reduce((sum, val) => sum + val, 0),
      totalCosts: Math.abs(cashflow.filter(v => v < 0).reduce((sum, val) => sum + val, 0))
    },
    updatedAt: new Date().toISOString()
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { projectId, scenarioId, scenario, variation } = await req.json();
    
    console.log('Calculating scenario for project:', projectId, 'scenario:', scenarioId);
    
    // Apply variation if provided (for sensitivity analysis)
    const adjustedScenario = variation ? applyVariation(scenario, variation) : scenario;
    
    // Run the calculation
    const result = runScenario(adjustedScenario);
    
    // If this is a variation calculation, store in risk_variations table
    if (variation) {
      const { error: variationError } = await supabase
        .from('risk_variations')
        .upsert({
          project_id: projectId,
          scenario_id: scenarioId,
          cost_variation_percent: variation.costVariationPercent,
          sale_price_variation_percent: variation.salePriceVariationPercent,
          interest_rate_variation_bps: variation.interestRateVariationBps,
          result_deltas: result
        });
      
      if (variationError) {
        console.error('Error storing risk variation:', variationError);
      }
    } else {
      // Cache the base result in scenario_results table
      const { error: upsertError } = await supabase
        .from('scenario_results')
        .upsert({
          project_id: projectId,
          scenario_id: scenarioId,
          result: result
        });
      
      if (upsertError) {
        console.error('Error caching scenario result:', upsertError);
        throw upsertError;
      }
    }
    
    console.log('Scenario calculation completed and cached');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in calculate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});