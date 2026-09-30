-- Run this in your Supabase SQL Editor to add the services JSON column to salons table
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;
