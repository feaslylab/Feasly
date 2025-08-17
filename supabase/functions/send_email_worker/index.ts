import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const resend = new Resend(resendApiKey)

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Email worker function triggered')

    // Add audit logging for worker execution
    const { error: auditError } = await supabase
      .from('email_queue_audit')
      .insert({
        action: 'worker_started',
        accessed_by: 'send_email_worker',
        details: { timestamp: new Date().toISOString(), function: 'scheduled_worker' }
      })

    if (auditError) {
      console.error('Error logging worker start:', auditError)
    }

    // Get unsent emails from queue - Service Role bypasses RLS which is intended for this worker
    const { data: emailQueue, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('sent', false)
      .limit(10) // Process max 10 emails per run

    if (queueError) {
      console.error('Error fetching email queue:', queueError)
      throw queueError
    }

    if (!emailQueue || emailQueue.length === 0) {
      console.log('No emails to send')
      return new Response(JSON.stringify({ message: 'No emails to send' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Processing ${emailQueue.length} emails`)

    let sentCount = 0
    let errorCount = 0

    // Process each email
    for (const email of emailQueue) {
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(email.user_id)
        
        if (userError || !userData.user?.email) {
          console.error(`Error getting user email for ${email.user_id}:`, userError)
          errorCount++
          continue
        }

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "Feasly <alerts@feasly.com>",
          to: [userData.user.email],
          subject: email.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Feasly Alert</h1>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
                <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #dc3545;">
                  ${email.body.replace(/\n/g, '<br>')}
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 6px;">
                  <p style="margin: 0; color: #1976d2; font-size: 14px;">
                    <strong>💡 Next Steps:</strong><br>
                    • Review your project assumptions and inputs<br>
                    • Consider scenario analysis to understand impact<br>
                    • Adjust your model parameters if needed
                  </p>
                </div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
                <p style="font-size: 12px; color: #6c757d; margin: 0;">
                  This alert was sent from your Feasly dashboard. You can manage your alert preferences in your account settings.
                </p>
              </div>
            </div>
          `,
        })

        if (emailResponse.error) {
          console.error(`Resend error for email ${email.id}:`, emailResponse.error)
          errorCount++
          continue
        }

        // Mark email as sent and log the processing
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({ sent: true })
          .eq('id', email.id)

        if (updateError) {
          console.error(`Error updating email status for ${email.id}:`, updateError)
        }

        // Add audit log for processed email
        await supabase
          .from('email_queue_audit')
          .insert({
            action: 'email_processed',
            email_queue_id: email.id,
            user_id: email.user_id,
            accessed_by: 'send_email_worker',
            details: { 
              resend_id: emailResponse.data?.id,
              timestamp: new Date().toISOString(),
              status: 'sent'
            }
          })

        // Log the sent email
        const { error: logError } = await supabase
          .from('email_log')
          .insert({
            user_id: email.user_id,
            to_email: userData.user.email,
            subject: email.subject,
            body: email.body,
            status: 'sent',
            resend_id: emailResponse.data?.id || null,
            sent_at: new Date().toISOString()
          })

        if (logError) {
          console.error(`Error logging email ${email.id}:`, logError)
        }

        sentCount++
        console.log(`Email sent successfully to ${userData.user.email}`)

      } catch (emailError) {
        console.error(`Error processing email ${email.id}:`, emailError)
        errorCount++

        // Log the failed email
        const { data: userData } = await supabase.auth.admin.getUserById(email.user_id)
        await supabase
          .from('email_log')
          .insert({
            user_id: email.user_id,
            to_email: userData?.user?.email || 'unknown',
            subject: email.subject,
            body: email.body,
            status: 'failed',
            error_message: emailError.message,
            sent_at: new Date().toISOString()
          })

        // Add audit log for failed email
        await supabase
          .from('email_queue_audit')
          .insert({
            action: 'email_failed',
            email_queue_id: email.id,
            user_id: email.user_id,
            accessed_by: 'send_email_worker',
            details: { 
              error: emailError.message,
              timestamp: new Date().toISOString(),
              status: 'failed'
            }
          })
      }
    }

    const result = {
      message: 'Email processing completed',
      processed: emailQueue.length,
      sent: sentCount,
      errors: errorCount
    }

    // Log worker completion
    await supabase
      .from('email_queue_audit')
      .insert({
        action: 'worker_completed',
        accessed_by: 'send_email_worker',
        details: { 
          ...result,
          timestamp: new Date().toISOString()
        }
      })

    console.log('Email worker result:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send_email_worker function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})