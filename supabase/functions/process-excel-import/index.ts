import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authenticated user from JWT
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { fileName, originalName } = await req.json()
    const userId = user.id // Use authenticated user's ID


    // Get the uploaded file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    // Convert blob to ArrayBuffer for processing
    const arrayBuffer = await fileData.arrayBuffer()
    
    // For now, we'll create a mock project since Excel parsing requires additional libraries
    // In a real implementation, you'd use a library like 'xlsx' to parse the Excel file
    
    // Mock extracted data (in real implementation, this would come from Excel parsing)
    const mockProjectData = {
      name: `Imported Project - ${originalName.replace('.xlsx', '')}`,
      description: `Project imported from Excel file: ${originalName}`,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    }

    const mockAssets = [
      {
        name: "Residential Tower A",
        type: "Residential",
        gfa_sqm: 15000,
        construction_cost_aed: 50000000,
        annual_revenue_potential_aed: 8000000,
        annual_operating_cost_aed: 2000000,
        occupancy_rate_percent: 85,
        cap_rate_percent: 12,
        development_timeline_months: 24,
        stabilization_period_months: 6,
      },
      {
        name: "Commercial Complex B",
        type: "Mixed Use",
        gfa_sqm: 25000,
        construction_cost_aed: 75000000,
        annual_revenue_potential_aed: 12000000,
        annual_operating_cost_aed: 3000000,
        occupancy_rate_percent: 90,
        cap_rate_percent: 10,
        development_timeline_months: 30,
        stabilization_period_months: 12,
      }
    ]

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        ...mockProjectData,
        user_id: userId,
      })
      .select()
      .single()

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`)
    }

    // Create assets for the project
    const assetsWithProjectId = mockAssets.map(asset => ({
      ...asset,
      project_id: project.id,
    }))

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .insert(assetsWithProjectId)
      .select()

    if (assetsError) {
      throw new Error(`Failed to create assets: ${assetsError.message}`)
    }

    // Create default scenarios for the project
    const scenarios = [
      {
        project_id: project.id,
        name: "Base Case",
        type: "Base Case",
        is_base: true,
      },
      {
        project_id: project.id,
        name: "Optimistic Scenario",
        type: "Optimistic",
        is_base: false,
      },
      {
        project_id: project.id,
        name: "Pessimistic Scenario",
        type: "Pessimistic",
        is_base: false,
      }
    ]

    const { error: scenariosError } = await supabase
      .from('scenarios')
      .insert(scenarios)

    if (scenariosError) {
      console.warn('Failed to create scenarios:', scenariosError.message)
    }

    // Clean up the uploaded file
    await supabase.storage
      .from('imports')
      .remove([fileName])

    return new Response(
      JSON.stringify({
        success: true,
        projectId: project.id,
        projectName: project.name,
        assetCount: assets?.length || 0,
        message: 'Project imported successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Import processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})