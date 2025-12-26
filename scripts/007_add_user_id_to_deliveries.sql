-- Add user_id column to link deliveries to users
ALTER TABLE deliveries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);

-- Update RLS policies to be user-specific
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all operations on deliveries" ON deliveries;
DROP POLICY IF EXISTS "Allow public insert on deliveries" ON deliveries;
DROP POLICY IF EXISTS "Allow public select on deliveries" ON deliveries;

-- Create new user-specific policies
CREATE POLICY "Users can view their own deliveries"
ON deliveries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deliveries"
ON deliveries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deliveries"
ON deliveries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deliveries"
ON deliveries FOR DELETE
USING (auth.uid() = user_id);
