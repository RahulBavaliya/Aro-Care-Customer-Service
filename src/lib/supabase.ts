import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  join_date: string;
  filter_type?: string;
  last_service?: string;
  next_service?: string;
  guarantee_expiry?: string;
  status: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  type: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMessage {
  id: string;
  customer_id?: string;
  template_id?: string;
  recipient_name: string;
  recipient_phone: string;
  message_type: string;
  template_content?: string;
  message_method: 'whatsapp' | 'sms';
  scheduled_for: string;
  status: string;
  sent_at?: string;
  created_at: string;
}

export interface FilterChange {
  id: string;
  customer_id: string;
  filter_type: string;
  change_date: string;
  next_due: string;
  technician?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface ServiceReview {
  id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  service_type: string;
  comment?: string;
  technician?: string;
  review_date: string;
  created_at: string;
}

export interface NotificationSetting {
  id: string;
  setting_type: string;
  enabled: boolean;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}