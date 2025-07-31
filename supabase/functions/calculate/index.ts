import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

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
  
  // Calculate KPIs
  const totalCashflow = cashflow.reduce((sum, val) => sum + val, 0);
  const npv = cashflow.reduce((acc, cf, i) => acc + cf / Math.pow(1.1, i / 12), 0);
  const irr = totalCashflow > 0 ? 0.15 : -0.05; // Simplified IRR calculation
  
  return {
    cashflow,
    kpis: {
      npv,
      irr,
      profit: totalCashflow,
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
    
    const { projectId, scenarioId, scenario } = await req.json();
    
    console.log('Calculating scenario for project:', projectId, 'scenario:', scenarioId);
    
    // Run the calculation
    const result = runScenario(scenario);
    
    // Cache the result in scenario_results table
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