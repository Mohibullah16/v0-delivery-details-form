-- Add financial columns to track service charges and product cost
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS service_charges DECIMAL(10, 2) DEFAULT NULL;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS product_cost DECIMAL(10, 2) DEFAULT NULL;
