-- Create deliveries table to store all delivery labels
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  cod_amount TEXT,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_cnic TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON public.deliveries(created_at DESC);

-- Since this is for internal use without user authentication,
-- we'll allow public insert access but you can modify this based on your needs
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert delivery records
CREATE POLICY "Allow public insert on deliveries"
  ON public.deliveries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to select delivery records (needed for QR code scanning)
CREATE POLICY "Allow public select on deliveries"
  ON public.deliveries
  FOR SELECT
  TO public
  USING (true);
