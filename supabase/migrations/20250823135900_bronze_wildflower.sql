/*
  # Initial Schema for Dada Aro Care Platform

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `address` (text)
      - `join_date` (date)
      - `filter_type` (text)
      - `last_service` (date)
      - `next_service` (date)
      - `guarantee_expiry` (date)
      - `status` (text)
      - `birth_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `message_templates`
      - `id` (uuid, primary key)
      - `type` (text)
      - `title` (text)
      - `content` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `scheduled_messages`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `template_id` (uuid, foreign key)
      - `recipient_name` (text)
      - `message_type` (text)
      - `scheduled_for` (timestamp)
      - `status` (text)
      - `sent_at` (timestamp)
      - `created_at` (timestamp)

    - `filter_changes`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `filter_type` (text)
      - `change_date` (date)
      - `next_due` (date)
      - `technician` (text)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamp)

    - `service_reviews`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `customer_name` (text)
      - `rating` (integer)
      - `service_type` (text)
      - `comment` (text)
      - `technician` (text)
      - `review_date` (date)
      - `created_at` (timestamp)

    - `notification_settings`
      - `id` (uuid, primary key)
      - `setting_type` (text)
      - `enabled` (boolean)
      - `configuration` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  join_date date DEFAULT CURRENT_DATE,
  filter_type text,
  last_service date,
  next_service date,
  guarantee_expiry date,
  status text DEFAULT 'Active',
  birth_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  template_id uuid REFERENCES message_templates(id) ON DELETE SET NULL,
  recipient_name text NOT NULL,
  message_type text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'Scheduled',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create filter_changes table
CREATE TABLE IF NOT EXISTS filter_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  filter_type text NOT NULL,
  change_date date NOT NULL,
  next_due date NOT NULL,
  technician text,
  status text DEFAULT 'Completed',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create service_reviews table
CREATE TABLE IF NOT EXISTS service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  service_type text NOT NULL,
  comment text,
  technician text,
  review_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_type text NOT NULL UNIQUE,
  enabled boolean DEFAULT true,
  configuration jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON message_templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON scheduled_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON filter_changes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON service_reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON notification_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default message templates
INSERT INTO message_templates (type, title, content) VALUES
('Birthday', 'Happy Birthday Wish', '🎂 Happy Birthday [NAME]! May your special day be filled with joy and happiness. Thank you for choosing Dada Aro Care for your water purification needs. Enjoy 10% off on your next service!'),
('Welcome', 'Aro Lagaya Welcome', '🙏 Welcome to the Dada Aro Care family, [NAME]! Your new water purifier has been successfully installed. We ensure pure, safe drinking water for you and your family. Our team is here 24/7 for any assistance.'),
('Filter Reminder', 'Filter Change Due', '🔧 Dear [NAME], it''s time to change your water filter! Your filter installed on [INSTALL_DATE] is due for replacement. Book your service appointment today for uninterrupted pure water supply.'),
('Guarantee', 'Guarantee Expiry Notice', '⏰ Dear [NAME], your Dada Aro Care guarantee period is expiring on [EXPIRY_DATE]. Renew your warranty to continue enjoying hassle-free service and genuine spare parts.');

-- Insert default notification settings
INSERT INTO notification_settings (setting_type, enabled, configuration) VALUES
('birthday', true, '{"time": "09:00", "daysBefore": 1}'),
('welcome', true, '{"immediate": true, "followUp": true, "followUpDays": 7}'),
('guarantee', true, '{"reminderDays": [30, 15, 7], "expiredNotification": true}'),
('filter', true, '{"reminderDays": [7, 3, 1], "customIntervals": true}'),
('promotional', true, '{"frequency": "weekly", "festivals": true}'),
('loan', true, '{"reminderFrequency": "monthly"}');

-- Insert sample customers
INSERT INTO customers (name, phone, email, address, join_date, filter_type, last_service, next_service, guarantee_expiry, status, birth_date) VALUES
('Rahul Sharma', '+91 98765 43210', 'rahul.sharma@email.com', 'Delhi, India', '2023-01-15', 'RO + UV', '2024-01-15', '2024-04-15', '2026-01-15', 'Active', '1985-03-20'),
('Priya Patel', '+91 87654 32109', 'priya.patel@email.com', 'Mumbai, India', '2023-03-20', 'UV + UF', '2024-02-10', '2024-05-10', '2025-03-20', 'Active', '1990-07-15'),
('Amit Kumar', '+91 76543 21098', 'amit.kumar@email.com', 'Bangalore, India', '2022-11-08', 'RO', '2024-01-20', '2024-04-20', '2024-11-08', 'Warranty Expired', '1988-12-05');

-- Insert sample service reviews
INSERT INTO service_reviews (customer_id, customer_name, rating, service_type, comment, technician, review_date) VALUES
((SELECT id FROM customers WHERE name = 'Rahul Sharma'), 'Rahul Sharma', 5, 'Filter Installation', 'Excellent service! The technician was professional and explained everything clearly. Water quality has improved significantly.', 'Ravi Kumar', '2024-01-20'),
((SELECT id FROM customers WHERE name = 'Priya Patel'), 'Priya Patel', 5, 'Filter Change', 'Very satisfied with the prompt service. The new filter is working perfectly and the team was courteous.', 'Suresh Yadav', '2024-01-19'),
((SELECT id FROM customers WHERE name = 'Amit Kumar'), 'Amit Kumar', 4, 'Maintenance', 'Good service overall. Technician arrived on time and fixed the issue quickly. Would recommend to others.', 'Vikash Singh', '2024-01-18');