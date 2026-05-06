-- ================================================================
-- Migration 005: Geo-Location Filtering System
-- Run this in the Supabase SQL Editor
-- ================================================================

-- 1. Add country fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

-- country_of_origin is the canonical shipping/production country for suppliers
-- default_country is the preferred browsing country for customers
-- We use a single 'country' column on profiles since role already differentiates them.

-- 2. Add supplier_country to supplier_products so products carry geo info
--    (denormalised for fast filtering without joins)
ALTER TABLE public.supplier_products
  ADD COLUMN IF NOT EXISTS supplier_country TEXT DEFAULT NULL;

-- 3. Back-fill: pull supplier's country into existing products
UPDATE public.supplier_products sp
SET supplier_country = p.country
FROM public.profiles p
WHERE sp.supplier_id = p.id
  AND p.country IS NOT NULL
  AND sp.supplier_country IS NULL;

-- 4. Create a trigger to keep supplier_country in sync when a supplier
--    updates their profile country
CREATE OR REPLACE FUNCTION sync_supplier_country()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run for SUPPLIER role rows
  IF NEW.role = 'SUPPLIER' AND NEW.country IS DISTINCT FROM OLD.country THEN
    UPDATE public.supplier_products
    SET supplier_country = NEW.country
    WHERE supplier_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_supplier_country ON public.profiles;
CREATE TRIGGER trg_sync_supplier_country
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE sync_supplier_country();

-- 5. Index for fast country-based filtering
CREATE INDEX IF NOT EXISTS idx_supplier_products_country
  ON public.supplier_products (supplier_country);

CREATE INDEX IF NOT EXISTS idx_profiles_country
  ON public.profiles (country);
