import { supabase } from './supabase';

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  to: string;
  method: 'whatsapp';
  provider?: string;
}

export interface BulkMessageResult {
  success: boolean;
  totalMessages: number;
  successCount: number;
  errorCount: number;
  results: Array<{
    customerId?: string;
    customerName: string;
    to: string;
    method: 'whatsapp';
    messageId?: string;
    status: string;
    success: boolean;
  }>;
  errors: Array<{
    customerId?: string;
    customerName: string;
    to: string;
    method: 'whatsapp';
    error: string;
    success: boolean;
  }>;
}

/**
 * Send a single WhatsApp message via Meta Business API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  customerName?: string,
  messageType?: string
): Promise<MessageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
      body: {
        to,
        message,
        customerName,
        messageType,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: data.success,
      messageId: data.messageId,
      to: data.to,
      method: 'whatsapp',
      provider: data.provider,
      error: data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      to,
      method: 'whatsapp',
    };
  }
}

/**
 * Send bulk WhatsApp messages to multiple recipients
 */
export async function sendBulkWhatsAppMessages(
  messages: Array<{
    to: string;
    message: string;
    method: 'whatsapp';
    customerName: string;
    customerId?: string;
    messageType?: string;
  }>
): Promise<BulkMessageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-bulk-whatsapp', {
      body: { messages },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      totalMessages: messages.length,
      successCount: 0,
      errorCount: messages.length,
      results: [],
      errors: messages.map(msg => ({
        customerId: msg.customerId,
        customerName: msg.customerName,
        to: msg.to,
        method: 'whatsapp',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      })),
    };
  }
}

/**
 * Update scheduled message status after sending
 */
export async function updateScheduledMessageStatus(
  messageId: string,
  status: 'Sent' | 'Failed',
  sentAt?: string,
  errorMessage?: string
) {
  try {
    const updateData: any = {
      status,
      sent_at: sentAt || new Date().toISOString(),
    };

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('scheduled_messages')
      .update(updateData)
      .eq('id', messageId);

    if (error) {
      console.error('Error updating scheduled message status:', error);
    }
  } catch (error) {
    console.error('Error updating scheduled message status:', error);
  }
}

/**
 * Format phone number for international use
 */
export function formatPhoneNumber(phone: string, countryCode: string = '91'): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already has country code, return cleaned version
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // Add country code
  return `${countryCode}${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Validation for Indian phone numbers
  const phoneRegex = /^(91)?\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}
