-- This script verifies that RLS policies are correctly configured
-- RLS policies ensure users can only see their own deliveries

-- Check if RLS is enabled on deliveries table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'deliveries';

-- List all policies on deliveries table
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'deliveries'
ORDER BY policyname;

-- Test query - get deliveries for current user
-- In your app, this is done automatically by Supabase RLS
SELECT id, recipient_name, recipient_phone, user_id
FROM deliveries
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
