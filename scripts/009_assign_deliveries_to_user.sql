-- This script assigns all deliveries without a user_id to a specific user
-- Update the user_id value with your actual user ID from Supabase Auth
-- You can find your user ID by logging in and checking the user profile

UPDATE deliveries
SET user_id = '7f7567ef-421d-40ea-b530-838d6998a591'
WHERE user_id IS NULL;
