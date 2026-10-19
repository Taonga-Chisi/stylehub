-- StyleHub admin: salon approval, owner notices, and booking access hardening.
-- Run once in the Supabase SQL Editor after the salons and bookings tables exist.

ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

UPDATE public.salons SET approval_status = 'pending' WHERE approval_status IS NULL;
ALTER TABLE public.salons ALTER COLUMN approval_status SET DEFAULT 'pending';
ALTER TABLE public.salons ALTER COLUMN approval_status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'salons_approval_status_check'
      AND conrelid = 'public.salons'::regclass
  ) THEN
    ALTER TABLE public.salons
      ADD CONSTRAINT salons_approval_status_check
      CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view all salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can insert own salon" ON public.salons;
DROP POLICY IF EXISTS "Owners can update own salon" ON public.salons;
DROP POLICY IF EXISTS "Owners can delete own salon" ON public.salons;
DROP POLICY IF EXISTS "Public can view approved salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can view own salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can insert pending salons" ON public.salons;
DROP POLICY IF EXISTS "Owners can update own salon details" ON public.salons;

CREATE POLICY "Public can view approved salons"
  ON public.salons FOR SELECT
  USING (approval_status = 'approved' AND is_active = TRUE);

CREATE POLICY "Owners can view own salons"
  ON public.salons FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert pending salons"
  ON public.salons FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND approval_status = 'pending');

CREATE POLICY "Owners can update own salon details"
  ON public.salons FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Salon owners may edit listing details, but only the trusted admin API may
-- change the approval status. The service key never belongs in the frontend.
CREATE OR REPLACE FUNCTION public.prevent_owner_salon_moderation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status
     AND auth.role() <> 'service_role'
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN
    RAISE EXCEPTION 'Only StyleHub administrators can change salon approval status';
  END IF;
  IF OLD.approved_at IS DISTINCT FROM NEW.approved_at
     AND auth.role() <> 'service_role'
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN
    RAISE EXCEPTION 'Only StyleHub administrators can change salon approval dates';
  END IF;
  IF OLD.is_active IS DISTINCT FROM NEW.is_active
     AND auth.role() <> 'service_role'
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN
    RAISE EXCEPTION 'Only StyleHub administrators can remove or restore salon listings';
  END IF;
  IF OLD.deactivated_at IS DISTINCT FROM NEW.deactivated_at
     AND auth.role() <> 'service_role'
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' THEN
    RAISE EXCEPTION 'Only StyleHub administrators can change salon listing status';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_salon_moderation_fields ON public.salons;
CREATE TRIGGER guard_salon_moderation_fields
  BEFORE UPDATE ON public.salons
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_salon_moderation();

CREATE TABLE IF NOT EXISTS public.salon_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

ALTER TABLE public.salon_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can view their salon notices" ON public.salon_notifications;
DROP POLICY IF EXISTS "Owners can mark their salon notices read" ON public.salon_notifications;
CREATE POLICY "Owners can view their salon notices"
  ON public.salon_notifications FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "Owners can mark their salon notices read"
  ON public.salon_notifications FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
GRANT SELECT ON public.salon_notifications TO authenticated;
REVOKE INSERT, DELETE ON public.salon_notifications FROM anon, authenticated;
REVOKE UPDATE ON public.salon_notifications FROM anon, authenticated;
GRANT UPDATE (read_at) ON public.salon_notifications TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'salon_notifications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.salon_notifications;
  END IF;
END $$;

-- Do not expose customer names/emails or booking notes through public schedule
-- queries. The RPC returns only the date and time needed to prevent conflicts.
CREATE OR REPLACE FUNCTION public.get_booked_slots(p_salon_id UUID)
RETURNS TABLE(booked_date TEXT, booked_time TEXT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.date, b.time
  FROM public.bookings AS b
  WHERE b.salon_id = p_salon_id
    AND b.status IN ('pending', 'approved');
$$;
GRANT EXECUTE ON FUNCTION public.get_booked_slots(UUID) TO anon, authenticated;

-- Remove a salon listing from public search while retaining its booking and
-- commission history. Only the server-side Supabase service role may call this.
CREATE OR REPLACE FUNCTION public.admin_set_salon_active(p_salon_id UUID, p_is_active BOOLEAN)
RETURNS SETOF public.salons
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    UPDATE public.salons
    SET is_active = p_is_active,
        deactivated_at = CASE WHEN p_is_active THEN NULL ELSE NOW() END
    WHERE id = p_salon_id
    RETURNING *;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_salon_active(UUID, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_salon_active(UUID, BOOLEAN) TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can select bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON public.bookings;

-- Keep private booking details limited to the customer and the salon owner.
-- Existing client and owner SELECT / INSERT / UPDATE policies remain in place.
