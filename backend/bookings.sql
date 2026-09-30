-- ================================================================
-- StyleHub: Bookings Table + RLS Policies
-- Run this in your Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id     UUID        NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id    UUID        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  client_name  TEXT        NOT NULL DEFAULT '',
  client_email TEXT        NOT NULL DEFAULT '',
  service_name TEXT        NOT NULL,
  service_price INT        NOT NULL DEFAULT 0,
  service_dur   TEXT       NOT NULL DEFAULT '',
  date         TEXT        NOT NULL,   -- e.g. "Sep 22, 2026"
  time         TEXT        NOT NULL,   -- e.g. "10:00 AM"
  status       TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected','cancelled','completed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 1. Clients can view their own bookings
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
CREATE POLICY "Clients can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id);

-- 2. Salon owners can view bookings for their salons
DROP POLICY IF EXISTS "Owners can view salon bookings" ON public.bookings;
CREATE POLICY "Owners can view salon bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE public.salons.id = salon_id
      AND   public.salons.owner_id = auth.uid()
    )
  );

-- 3. Authenticated clients can create bookings
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
CREATE POLICY "Clients can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- 4. Salon owners can update (approve/reject) bookings for their salons
DROP POLICY IF EXISTS "Owners can update salon bookings" ON public.bookings;
CREATE POLICY "Owners can update salon bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE public.salons.id = salon_id
      AND   public.salons.owner_id = auth.uid()
    )
  );

-- 5. Clients can cancel their own pending bookings
DROP POLICY IF EXISTS "Clients can cancel own bookings" ON public.bookings;
CREATE POLICY "Clients can cancel own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = client_id AND status = 'pending');

-- 6. Allow authenticated users to view & update bookings
DROP POLICY IF EXISTS "Authenticated users can select bookings" ON public.bookings;
CREATE POLICY "Authenticated users can select bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update bookings" ON public.bookings;
CREATE POLICY "Authenticated users can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (true);

