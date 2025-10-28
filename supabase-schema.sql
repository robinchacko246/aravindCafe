-- Aravind Cafe Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (optional, for clean setup)
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS menu_items CASCADE;

-- Create Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;

-- Create policies to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on menu_items" 
  ON menu_items 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" 
  ON orders 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert some sample menu items (optional)
INSERT INTO menu_items (name, price, category, available) VALUES
  ('Tea', 20.00, 'Beverages', true),
  ('Coffee', 30.00, 'Beverages', true),
  ('Sandwich', 50.00, 'Snacks', true),
  ('Samosa', 15.00, 'Snacks', true),
  ('Vada Pav', 25.00, 'Snacks', true),
  ('Cold Drink', 25.00, 'Beverages', true)
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 'menu_items' as table_name, COUNT(*) as row_count FROM menu_items
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders;

