/*
  # Enhance messaging system with WhatsApp and SMS support

  1. Updates
    - Add message_method column to scheduled_messages table
    - Add template_content column to scheduled_messages table
    - Add recipient_phone column to scheduled_messages table
    - Update message templates with more sample data

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to scheduled_messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_messages' AND column_name = 'message_method'
  ) THEN
    ALTER TABLE scheduled_messages ADD COLUMN message_method text DEFAULT 'whatsapp';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_messages' AND column_name = 'template_content'
  ) THEN
    ALTER TABLE scheduled_messages ADD COLUMN template_content text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scheduled_messages' AND column_name = 'recipient_phone'
  ) THEN
    ALTER TABLE scheduled_messages ADD COLUMN recipient_phone text;
  END IF;
END $$;

-- Insert sample scheduled messages
INSERT INTO scheduled_messages (customer_id, template_id, recipient_name, recipient_phone, message_type, template_content, message_method, scheduled_for, status) VALUES
  (
    (SELECT id FROM customers LIMIT 1),
    (SELECT id FROM message_templates WHERE type = 'Birthday' LIMIT 1),
    'Rahul Sharma',
    '+91 98765 43210',
    'Birthday',
    'Dear [NAME], Wishing you a very Happy Birthday! 🎉 May this special day bring you joy and happiness. Thank you for choosing Dada Aro Care for your water purification needs.',
    'whatsapp',
    '2024-01-25 09:00:00+00',
    'Scheduled'
  ),
  (
    (SELECT id FROM customers OFFSET 1 LIMIT 1),
    (SELECT id FROM message_templates WHERE type = 'Filter Reminder' LIMIT 1),
    'Priya Patel',
    '+91 87654 32109',
    'Filter Reminder',
    'Dear [NAME], This is a friendly reminder that your water filter is due for replacement. Please contact us to schedule your service appointment.',
    'sms',
    '2024-01-26 10:00:00+00',
    'Scheduled'
  ),
  (
    (SELECT id FROM customers OFFSET 2 LIMIT 1),
    (SELECT id FROM message_templates WHERE type = 'Welcome' LIMIT 1),
    'Amit Kumar',
    '+91 76543 21098',
    'Welcome',
    'Welcome to Dada Aro Care family! Thank you for choosing us for your water purification needs. We are committed to providing you with the best service.',
    'whatsapp',
    '2024-01-25 14:00:00+00',
    'Sent'
  );

-- Add more sample message templates
INSERT INTO message_templates (type, title, content, status) VALUES
  ('Guarantee', 'Guarantee Expiry Reminder', 'Dear [NAME], Your water purifier guarantee will expire on [EXPIRY_DATE]. Contact us for renewal or extended warranty options.', 'Active'),
  ('Promotional', 'Festival Wishes', 'Dear [NAME], Wishing you and your family a very Happy [FESTIVAL]! 🎊 Special offers available on our services. Call us for details.', 'Active'),
  ('Loan', 'Loan Reminder', 'Dear [NAME], This is a reminder about your loan installment due on [DUE_DATE]. Please make the payment to avoid any inconvenience.', 'Active');