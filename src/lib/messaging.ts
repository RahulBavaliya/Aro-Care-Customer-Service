import { supabase } from './supabase';

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  to: string;
  method: 'whatsapp' | 'sms';
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
    method: 'whatsapp' | 'sms';
    messageId?: string;
    status: string;
    success: boolean;
  }>;
  errors: Array<{
    customerId?: string;
    customerName: string;
    to: string;
    method: 'whatsapp' | 'sms';
    error: string;
    success: boolean;
  }>;
}

/**
 * Send a single message via WhatsApp or SMS
 */
export async function sendMessage(
  to: string,
  message: string,
  method: 'whatsapp' | 'sms',
  customerName?: string
): Promise<MessageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-message', {
      body: {
        to,
        message,
        method,
        customerName,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: data.success,
      messageId: data.messageId,
      to: data.to,
      method,
      error: data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      to,
      method,
    };
  }
}

/**
 * Send bulk messages to multiple recipients
 */
export async function sendBulkMessages(
  messages: Array<{
    to: string;
    message: string;
    method: 'whatsapp' | 'sms';
    customerName: string;
    customerId?: string;
  }>
): Promise<BulkMessageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-bulk-messages', {
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
        method: msg.method,
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
export function formatPhoneNumber(phone: string, countryCode: string = '+91'): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already has country code, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Add country code
  return `${countryCode}${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic validation for phone numbers
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Get message delivery status
 */
export async function getMessageStatus(messageId: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('get-message-status', {
      body: { messageId },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error getting message status:', error);
    return null;
  }
}