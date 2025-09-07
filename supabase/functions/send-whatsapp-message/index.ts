import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessageRequest {
  to: string
  message: string
  customerName?: string
  messageType?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message, customerName, messageType }: WhatsAppMessageRequest = await req.json()

    // Get Meta WhatsApp Business API credentials from environment
    const accessToken = Deno.env.get('META_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID')
    const businessAccountId = Deno.env.get('META_BUSINESS_ACCOUNT_ID')

    if (!accessToken || !phoneNumberId) {
      throw new Error('Meta WhatsApp credentials not configured')
    }

    // Format phone number (remove + and ensure it starts with country code)
    const formattedTo = to.replace(/\D/g, '').startsWith('91') 
      ? to.replace(/\D/g, '') 
      : `91${to.replace(/\D/g, '')}`

    // Meta WhatsApp Business API endpoint
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    // Prepare message payload
    const messagePayload = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "text",
      text: {
        body: message
      }
    }

    // Send message via Meta WhatsApp Business API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Meta WhatsApp API error: ${result.error?.message || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messages?.[0]?.id,
        status: 'sent',
        method: 'whatsapp',
        to: formattedTo,
        message: `WhatsApp message sent successfully to ${customerName || formattedTo}`,
        provider: 'Meta Business API'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('WhatsApp message sending error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send WhatsApp message',
        provider: 'Meta Business API'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})