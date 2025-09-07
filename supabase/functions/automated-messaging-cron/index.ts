import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const today = new Date()
    const todayIST = new Date(today.getTime() + (5.5 * 60 * 60 * 1000)) // Convert to IST
    const todayDateString = todayIST.toISOString().split('T')[0]
    const currentMonth = todayIST.getMonth() + 1
    const currentDay = todayIST.getDate()

    console.log(`Running automated messaging cron job for ${todayDateString}`)

    let totalMessagesSent = 0
    let totalErrors = 0
    const results = []

    // 1. BIRTHDAY MESSAGES
    try {
      // Get customers with birthdays today
      const { data: allCustomers } = await supabase
        .from('customers')
        .select('*')
        .not('birth_date', 'is', null)

      const birthdayCustomers = (allCustomers || []).filter(customer => {
        if (!customer.birth_date) return false
        const birthDate = new Date(customer.birth_date)
        return birthDate.getMonth() + 1 === currentMonth && birthDate.getDate() === currentDay
      })

      if (birthdayCustomers.length > 0) {
        // Get birthday message template
        const { data: birthdayTemplate } = await supabase
          .from('message_templates')
          .select('*')
          .eq('type', 'birthday')
          .eq('status', 'Active')
          .single()

        if (birthdayTemplate) {
          for (const customer of birthdayCustomers) {
            const personalizedMessage = birthdayTemplate.content
              .replace(/\[NAME\]/g, customer.name)
              .replace(/\[PHONE\]/g, customer.phone)
              .replace(/\[FILTER_TYPE\]/g, customer.filter_type || 'Standard')

            // Send WhatsApp message
            const messageResult = await sendWhatsAppMessage(
              customer.phone,
              personalizedMessage,
              customer.name,
              'birthday'
            )

            // Save to scheduled_messages table
            await supabase.from('scheduled_messages').insert({
              customer_id: customer.id,
              template_id: birthdayTemplate.id,
              recipient_name: customer.name,
              recipient_phone: customer.phone,
              message_type: 'birthday',
              message_method: 'whatsapp',
              template_content: personalizedMessage,
              scheduled_for: todayIST.toISOString(),
              status: messageResult.success ? 'Sent' : 'Failed',
              sent_at: messageResult.success ? todayIST.toISOString() : null
            })

            if (messageResult.success) {
              totalMessagesSent++
              results.push(`Birthday message sent to ${customer.name}`)
            } else {
              totalErrors++
              results.push(`Failed to send birthday message to ${customer.name}: ${messageResult.error}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Birthday messaging error:', error)
      results.push(`Birthday messaging error: ${error.message}`)
    }

    // 2. FILTER CHANGE REMINDERS
    try {
      // Get customers with filters due today or overdue
      const { data: filterDueCustomers } = await supabase
        .from('customers')
        .select('*')
        .not('next_service', 'is', null)
        .lte('next_service', todayDateString)

      if (filterDueCustomers && filterDueCustomers.length > 0) {
        // Get filter reminder template
        const { data: filterTemplate } = await supabase
          .from('message_templates')
          .select('*')
          .eq('type', 'filter_reminder')
          .eq('status', 'Active')
          .single()

        if (filterTemplate) {
          for (const customer of filterDueCustomers) {
            const personalizedMessage = filterTemplate.content
              .replace(/\[NAME\]/g, customer.name)
              .replace(/\[PHONE\]/g, customer.phone)
              .replace(/\[FILTER_TYPE\]/g, customer.filter_type || 'Standard')

            // Send WhatsApp message
            const messageResult = await sendWhatsAppMessage(
              customer.phone,
              personalizedMessage,
              customer.name,
              'filter_reminder'
            )

            // Save to scheduled_messages table
            await supabase.from('scheduled_messages').insert({
              customer_id: customer.id,
              template_id: filterTemplate.id,
              recipient_name: customer.name,
              recipient_phone: customer.phone,
              message_type: 'filter_reminder',
              message_method: 'whatsapp',
              template_content: personalizedMessage,
              scheduled_for: todayIST.toISOString(),
              status: messageResult.success ? 'Sent' : 'Failed',
              sent_at: messageResult.success ? todayIST.toISOString() : null
            })

            if (messageResult.success) {
              totalMessagesSent++
              results.push(`Filter reminder sent to ${customer.name}`)
            } else {
              totalErrors++
              results.push(`Failed to send filter reminder to ${customer.name}: ${messageResult.error}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Filter reminder error:', error)
      results.push(`Filter reminder error: ${error.message}`)
    }

    // 3. GUARANTEE EXPIRY REMINDERS
    try {
      // Get customers with guarantees expiring in 7 days
      const sevenDaysFromNow = new Date(todayIST)
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      const sevenDaysDateString = sevenDaysFromNow.toISOString().split('T')[0]

      const { data: guaranteeCustomers } = await supabase
        .from('customers')
        .select('*')
        .not('guarantee_expiry', 'is', null)
        .eq('guarantee_expiry', sevenDaysDateString)

      if (guaranteeCustomers && guaranteeCustomers.length > 0) {
        // Get guarantee template
        const { data: guaranteeTemplate } = await supabase
          .from('message_templates')
          .select('*')
          .eq('type', 'guarantee')
          .eq('status', 'Active')
          .single()

        if (guaranteeTemplate) {
          for (const customer of guaranteeCustomers) {
            const personalizedMessage = guaranteeTemplate.content
              .replace(/\[NAME\]/g, customer.name)
              .replace(/\[PHONE\]/g, customer.phone)
              .replace(/\[FILTER_TYPE\]/g, customer.filter_type || 'Standard')

            // Send WhatsApp message
            const messageResult = await sendWhatsAppMessage(
              customer.phone,
              personalizedMessage,
              customer.name,
              'guarantee'
            )

            // Save to scheduled_messages table
            await supabase.from('scheduled_messages').insert({
              customer_id: customer.id,
              template_id: guaranteeTemplate.id,
              recipient_name: customer.name,
              recipient_phone: customer.phone,
              message_type: 'guarantee',
              message_method: 'whatsapp',
              template_content: personalizedMessage,
              scheduled_for: todayIST.toISOString(),
              status: messageResult.success ? 'Sent' : 'Failed',
              sent_at: messageResult.success ? todayIST.toISOString() : null
            })

            if (messageResult.success) {
              totalMessagesSent++
              results.push(`Guarantee reminder sent to ${customer.name}`)
            } else {
              totalErrors++
              results.push(`Failed to send guarantee reminder to ${customer.name}: ${messageResult.error}`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Guarantee reminder error:', error)
      results.push(`Guarantee reminder error: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: todayDateString,
        time: '12:30 AM IST',
        totalMessagesSent,
        totalErrors,
        results,
        message: `Automated messaging completed: ${totalMessagesSent} sent, ${totalErrors} failed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Cron job error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Automated messaging cron job failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to send WhatsApp message
async function sendWhatsAppMessage(to: string, message: string, customerName: string, messageType: string) {
  try {
    const accessToken = Deno.env.get('META_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID')

    if (!accessToken || !phoneNumberId) {
      throw new Error('Meta WhatsApp credentials not configured')
    }

    const formattedTo = to.replace(/\D/g, '').startsWith('91') 
      ? to.replace(/\D/g, '') 
      : `91${to.replace(/\D/g, '')}`

    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    const messagePayload = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "text",
      text: {
        body: message
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload)
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        to: formattedTo
      }
    } else {
      return {
        success: false,
        error: result.error?.message || 'Unknown error',
        to: formattedTo
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      to
    }
  }
}