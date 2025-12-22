-- Drop the existing check constraint and create a new one with all status values
ALTER TABLE deliveries DROP CONSTRAINT deliveries_status_check;

ALTER TABLE deliveries 
ADD CONSTRAINT deliveries_status_check 
CHECK (status IN ('new', 'prepared', 'shipped', 'delivered', 'payment_received', 'returned', 'cancelled'));

-- Update the default status to 'new'
ALTER TABLE deliveries 
ALTER COLUMN status SET DEFAULT 'new';
