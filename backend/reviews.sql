-- ========================================================
-- StyleHub Reviews SQL Schema
-- Run this script in your Supabase SQL Editor
-- ========================================================

-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id TEXT, -- supports text/uuid salon ids
    salon_name TEXT,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL DEFAULT 'Client',
    client_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
CREATE POLICY "Allow public read access to reviews"
    ON public.reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert reviews" ON public.reviews;
CREATE POLICY "Allow authenticated users to insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to delete their own reviews" ON public.reviews;
CREATE POLICY "Allow users to delete their own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = client_id);
