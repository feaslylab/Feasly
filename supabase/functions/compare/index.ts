import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompareRequest {
  projectId: string;
  scenarioIds: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { projectId, scenarioIds }: CompareRequest = await req.json();

    console.log(`Comparing scenarios for project ${projectId}:`, scenarioIds);

    if (!projectId || !scenarioIds || scenarioIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Project ID and scenario IDs are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Batch fetch calculations for all scenarios
    const calculations = await Promise.all(
      scenarioIds.map(async (scenarioId) => {
        try {
          console.log(`Fetching calculation for scenario ${scenarioId}`);
          
          const { data, error } = await supabase.functions.invoke('calculate', {
            body: { projectId, scenarioId }
          });

          if (error) {
            console.error(`Error calculating scenario ${scenarioId}:`, error);
            return {
              scenarioId,
              error: error.message || 'Calculation failed',
              kpis: null,
              cashflow: null
            };
          }

          return {
            scenarioId,
            kpis: data.kpis,
            cashflow: data.cashflow,
            error: null
          };
        } catch (err) {
          console.error(`Exception calculating scenario ${scenarioId}:`, err);
          return {
            scenarioId,
            error: err.message || 'Unknown error',
            kpis: null,
            cashflow: null
          };
        }
      })
    );

    // Get scenario names
    const { data: scenarios, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id, scenario_type')
      .in('id', scenarioIds);

    if (scenarioError) {
      console.error('Error fetching scenario names:', scenarioError);
    }

    // Combine results with scenario metadata
    const results = calculations.map(calc => {
      const scenario = scenarios?.find(s => s.id === calc.scenarioId);
      return {
        ...calc,
        scenarioName: scenario?.scenario_type || 'Unknown'
      };
    });

    console.log(`Successfully compared ${results.length} scenarios`);

    return new Response(
      JSON.stringify({ 
        projectId,
        comparisons: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Compare function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});