import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkMessageRequest {
  messages: Array<{
    to: string
    message: string
    method: 'whatsapp' | 'sms'
    customerName: string
    customerId?: string
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages }: BulkMessageRequest = await req.json()

    // Get environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    const results = []
    const errors = []

    // Send messages with delay to avoid rate limiting
    for (let i = 0; i < messages.length; i++) {
      const { to, message, method, customerName, customerId } = messages[i]
      
      try {
        // Format phone number
        const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '')}`
        
        let response
        
        if (method === 'whatsapp') {
          const whatsappTo = `whatsapp:${formattedTo}`
          const whatsappFrom = twilioWhatsAppNumber || 'whatsapp:+14155238886'
          
          response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: whatsappFrom,
              To: whatsappTo,
              Body: message,
            }),
          })
        } else {
          const smsFrom = twilioPhoneNumber || '+1234567890'
          
          response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: smsFrom,
              To: formattedTo,
              Body: message,
            }),
          })
        }

        const result = await response.json()

        if (response.ok) {
          results.push({
            customerId,
            customerName,
            to: formattedTo,
            method,
            messageId: result.sid,
            status: 'sent',
            success: true,
          })
        } else {
          errors.push({
            customerId,
            customerName,
            to: formattedTo,
            method,
            error: result.message || 'Unknown error',
            success: false,
          })
        }

        // Add delay between messages to avoid rate limiting (1 message per second)
        if (i < messages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        errors.push({
          customerId,
          customerName,
          to,
          method,
          error: error.message,
          success: false,
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalMessages: messages.length,
        successCount: results.length,
        errorCount: errors.length,
        results,
        errors,
        message: `Bulk messaging completed: ${results.length} sent, ${errors.length} failed`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Bulk messaging error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send bulk messages',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})