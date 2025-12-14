-- Enable Row Level Security
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Allow all operations (select, insert, update, delete) for everyone
-- This is suitable for an internal delivery management system
CREATE POLICY "Allow all operations on deliveries"
ON deliveries
FOR ALL
USING (true)
WITH CHECK (true);
