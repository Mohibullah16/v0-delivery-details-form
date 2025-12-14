-- Add status column to deliveries table
ALTER TABLE deliveries 
ADD COLUMN status TEXT DEFAULT 'prepared' CHECK (status IN ('prepared', 'shipped', 'delivered', 'payment_received'));

-- Update existing records to have default status
UPDATE deliveries SET status = 'prepared' WHERE status IS NULL;
