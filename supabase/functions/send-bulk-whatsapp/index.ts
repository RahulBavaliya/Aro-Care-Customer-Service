import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkWhatsAppRequest {
  messages: Array<{
    to: string
    message: string
    customerName: string
    customerId?: string
    messageType?: string
  }>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages }: BulkWhatsAppRequest = await req.json()

    // Get Meta WhatsApp Business API credentials
    const accessToken = Deno.env.get('META_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID')

    if (!accessToken || !phoneNumberId) {
      throw new Error('Meta WhatsApp credentials not configured')
    }

    const results = []
    const errors = []
    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    // Send messages with delay to avoid rate limiting
    for (let i = 0; i < messages.length; i++) {
      const { to, message, customerName, customerId, messageType } = messages[i]
      
      try {
        // Format phone number
        const formattedTo = to.replace(/\D/g, '').startsWith('91') 
          ? to.replace(/\D/g, '') 
          : `91${to.replace(/\D/g, '')}`

        // Prepare message payload
        const messagePayload = {
          messaging_product: "whatsapp",
          to: formattedTo,
          type: "text",
          text: {
            body: message
          }
        }

        // Send message
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
          results.push({
            customerId,
            customerName,
            to: formattedTo,
            method: 'whatsapp',
            messageId: result.messages?.[0]?.id,
            status: 'sent',
            success: true,
          })
        } else {
          errors.push({
            customerId,
            customerName,
            to: formattedTo,
            method: 'whatsapp',
            error: result.error?.message || 'Unknown error',
            success: false,
          })
        }

        // Add delay between messages (Meta allows 1000 messages per second, but we'll be conservative)
        if (i < messages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
        }

      } catch (error) {
        errors.push({
          customerId,
          customerName,
          to,
          method: 'whatsapp',
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
        message: `Bulk WhatsApp messaging completed: ${results.length} sent, ${errors.length} failed`,
        provider: 'Meta Business API'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Bulk WhatsApp messaging error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to send bulk WhatsApp messages',
        provider: 'Meta Business API'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})