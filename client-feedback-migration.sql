-- ═══════════════════════════════════════════════════════════════
-- Client feedback round — schema changes
-- Run this in the Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Real review dates (for chronological sorting) ───
-- Google reviews only had a free-text label ("2 weeks ago"), which can't be sorted.
-- Facebook reviews already have review_date (TEXT) and the admin already saves an
-- ISO date there, so no change is needed on that table.
ALTER TABLE google_reviews ADD COLUMN IF NOT EXISTS review_date DATE;

-- ─── 2. New "Happy Customers" carousel ───
-- carousel_name has a CHECK constraint listing the allowed carousels, so it has to
-- be recreated to accept the new value. returning_customers stays allowed so the
-- existing rows remain valid even though the carousel is no longer shown on the site.
ALTER TABLE carousel_items DROP CONSTRAINT IF EXISTS carousel_items_carousel_name_check;
ALTER TABLE carousel_items ADD CONSTRAINT carousel_items_carousel_name_check
  CHECK (carousel_name IN ('recent_works', 'highlights', 'returning_customers', 'tailor_jobs', 'happy_customers'));
