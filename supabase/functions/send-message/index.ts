import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageRequest {
  to: string
  message: string
  method: 'whatsapp' | 'sms'
  customerName?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message, method, customerName }: MessageRequest = await req.json()

    // Get environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // e.g., 'whatsapp:+14155238886'
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') // e.g., '+1234567890'

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    // Format phone number
    const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '')}`
    
    let response
    
    if (method === 'whatsapp') {
      // Send WhatsApp message via Twilio
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
      // Send SMS via Twilio
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

    if (!response.ok) {
      throw new Error(`Twilio API error: ${result.message || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.sid,
        status: result.status,
        method,
        to: formattedTo,
        message: `${method.toUpperCase()} message sent successfully to ${customerName || formattedTo}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Message sending error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send message',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})