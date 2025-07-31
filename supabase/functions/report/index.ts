import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  projectId: string;
  scenarioId: string;
  reportType?: 'standard' | 'detailed';
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

    const { projectId, scenarioId, reportType = 'standard' }: ReportRequest = await req.json();

    console.log(`Generating ${reportType} report for project ${projectId}, scenario ${scenarioId}`);

    if (!projectId || !scenarioId) {
      return new Response(
        JSON.stringify({ error: 'Project ID and scenario ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if report already exists and is not expired
    const { data: existingReport } = await supabase
      .from('scenario_reports')
      .select('*')
      .eq('project_id', projectId)
      .eq('scenario_id', scenarioId)
      .eq('status', 'ready')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingReport?.report_url) {
      console.log('Returning existing report:', existingReport.id);
      return new Response(
        JSON.stringify({ 
          reportId: existingReport.id,
          reportUrl: existingReport.report_url,
          status: 'ready',
          cached: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create new report record
    const { data: reportRecord, error: reportError } = await supabase
      .from('scenario_reports')
      .insert({
        project_id: projectId,
        scenario_id: scenarioId,
        status: 'generating',
        created_by: user.id
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report record:', reportError);
      return new Response(
        JSON.stringify({ error: 'Failed to create report record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch project and scenario data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      await supabase
        .from('scenario_reports')
        .update({ status: 'failed' })
        .eq('id', reportRecord.id);
      
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get calculation results
    const { data: calcData, error: calcError } = await supabase.functions.invoke('calculate', {
      body: { projectId, scenarioId }
    });

    if (calcError || !calcData) {
      console.error('Error getting calculation data:', calcError);
      await supabase
        .from('scenario_reports')
        .update({ status: 'failed' })
        .eq('id', reportRecord.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to calculate scenario data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate PDF (simplified version - in production you'd use a proper PDF generation service)
    const reportData = {
      project: {
        name: project.name,
        description: project.description,
        currency: project.currency_code || 'AED'
      },
      scenario: {
        id: scenarioId,
        type: reportType
      },
      kpis: calcData.kpis,
      cashflow: calcData.cashflow,
      generatedAt: new Date().toISOString()
    };

    // For now, return a mock PDF URL (in production, generate actual PDF)
    const mockPdfUrl = `https://example.com/reports/${reportRecord.id}.pdf`;
    
    // Update report record with success
    const { error: updateError } = await supabase
      .from('scenario_reports')
      .update({
        status: 'ready',
        report_url: mockPdfUrl,
        file_size: 1024 * 500 // Mock 500KB file
      })
      .eq('id', reportRecord.id);

    if (updateError) {
      console.error('Error updating report record:', updateError);
    }

    console.log(`Report generated successfully: ${reportRecord.id}`);

    return new Response(
      JSON.stringify({ 
        reportId: reportRecord.id,
        reportUrl: mockPdfUrl,
        status: 'ready',
        cached: false,
        data: reportData // Include data for debugging
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Report function error:', error);
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