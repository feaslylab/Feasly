import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface KPIRow {
  user_id: string
  project_id: string
  npv: number
  irr: number | null
  profit: number
  created_at: string
}

interface AlertPref {
  user_id: string
  irr_threshold: number
  npv_threshold: number
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('KPI Alert function triggered')

    // Query recent KPI snapshots (last 15 minutes)
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_snapshot')
      .select(`
        user_id,
        project_id,
        npv,
        irr,
        profit,
        created_at
      `)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

    if (kpiError) {
      console.error('Error fetching KPI data:', kpiError)
      throw kpiError
    }

    if (!kpiData || kpiData.length === 0) {
      console.log('No recent KPI data found')
      return new Response(JSON.stringify({ message: 'No recent KPI data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Processing ${kpiData.length} KPI records`)

    // Group by user to get their alert preferences
    const userIds = [...new Set(kpiData.map(k => k.user_id))]

    // Fetch alert preferences for all users
    const { data: alertPrefs, error: prefError } = await supabase
      .from('alert_pref')
      .select('*')
      .in('user_id', userIds)

    if (prefError) {
      console.error('Error fetching alert preferences:', prefError)
      throw prefError
    }

    // Create a map of user preferences with defaults
    const prefMap = new Map<string, AlertPref>()
    userIds.forEach(userId => {
      const pref = alertPrefs?.find(p => p.user_id === userId)
      prefMap.set(userId, {
        user_id: userId,
        irr_threshold: pref?.irr_threshold ?? 0.08, // 8% default
        npv_threshold: pref?.npv_threshold ?? 0     // 0 AED default
      })
    })

    let alertsCreated = 0
    let emailsQueued = 0

    // Process each KPI record
    for (const kpi of kpiData) {
      const userPref = prefMap.get(kpi.user_id)!
      const irrBreach = kpi.irr !== null && kpi.irr < userPref.irr_threshold
      const npvBreach = kpi.npv < userPref.npv_threshold

      if (irrBreach || npvBreach) {
        // Check if alert already exists for this project
        const { data: existingAlert } = await supabase
          .from('feasly_alerts')
          .select('id')
          .eq('project_id', kpi.project_id)
          .eq('alert_type', 'kpi_breach')
          .eq('resolved', false)
          .single()

        if (!existingAlert) {
          // Create new alert
          const alertTitle = irrBreach && npvBreach 
            ? 'IRR & NPV Breach' 
            : irrBreach 
            ? 'IRR Below Threshold' 
            : 'NPV Below Threshold'

          const alertBody = irrBreach && npvBreach
            ? `IRR: ${(kpi.irr! * 100).toFixed(2)}% (threshold: ${(userPref.irr_threshold * 100).toFixed(2)}%), NPV: ${kpi.npv.toLocaleString()} AED (threshold: ${userPref.npv_threshold.toLocaleString()} AED)`
            : irrBreach
            ? `IRR: ${(kpi.irr! * 100).toFixed(2)}% (threshold: ${(userPref.irr_threshold * 100).toFixed(2)}%)`
            : `NPV: ${kpi.npv.toLocaleString()} AED (threshold: ${userPref.npv_threshold.toLocaleString()} AED)`

          const { error: alertError } = await supabase
            .from('feasly_alerts')
            .insert({
              project_id: kpi.project_id,
              alert_type: 'kpi_breach',
              title: alertTitle,
              body: alertBody,
              severity: 'high',
              metadata: {
                npv: kpi.npv,
                irr: kpi.irr,
                profit: kpi.profit,
                thresholds: {
                  npv_threshold: userPref.npv_threshold,
                  irr_threshold: userPref.irr_threshold
                }
              }
            })

          if (alertError) {
            console.error('Error creating alert:', alertError)
          } else {
            alertsCreated++
            console.log(`Alert created for project ${kpi.project_id}`)
          }

          // Queue email notification
          const emailSubject = `Feasly Alert: ${alertTitle}`
          const emailBody = `
            Your project has breached KPI thresholds:
            
            ${alertBody}
            
            Please review your project in Feasly dashboard.
          `

          const { error: emailError } = await supabase
            .from('email_queue')
            .insert({
              user_id: kpi.user_id,
              subject: emailSubject,
              body: emailBody
            })

          if (emailError) {
            console.error('Error queuing email:', emailError)
          } else {
            emailsQueued++
            console.log(`Email queued for user ${kpi.user_id}`)
          }
        }
      }
    }

    const result = {
      message: 'KPI alert check completed',
      processed: kpiData.length,
      alerts_created: alertsCreated,
      emails_queued: emailsQueued
    }

    console.log('Alert processing result:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in alert_kpi function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})