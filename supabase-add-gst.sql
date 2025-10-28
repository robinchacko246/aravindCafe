-- Add GST percentage column to menu_items table
-- Run this in your Supabase SQL Editor

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 0;

-- Update existing items to have 0% GST if needed
UPDATE menu_items 
SET gst_percentage = 0 
WHERE gst_percentage IS NULL;

-- Verify the changes
SELECT id, name, price, gst_percentage, category, available 
FROM menu_items 
LIMIT 5;

