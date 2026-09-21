-- Run this in your Supabase SQL Editor to fix the search visibility issue.
-- This ensures ANY visitor (logged in or not) can see all salon listings.

-- Drop conflicting policies first if they exist
DROP POLICY IF EXISTS "Public can view all salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can insert own salon" ON public.salons;
DROP POLICY IF EXISTS "Owners can update own salon" ON public.salons;

-- Re-create correct policies
CREATE POLICY "Public can view all salons"
  ON public.salons FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert own salon"
  ON public.salons FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own salon"
  ON public.salons FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own salon"
  ON public.salons FOR DELETE
  USING (auth.uid() = owner_id);
