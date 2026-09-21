-- 1. Drop the UNIQUE constraint on owner_id to allow multiple salons
ALTER TABLE public.salons DROP CONSTRAINT salons_owner_id_key;

-- 2. Add columns for images
ALTER TABLE public.salons ADD COLUMN cover_url TEXT;
ALTER TABLE public.salons ADD COLUMN logo_url TEXT;
