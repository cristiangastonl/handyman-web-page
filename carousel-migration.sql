-- ═══════════════════════════════════════════════════════════════
-- Carousel Items — curated views of work_items
-- Run this in the Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS carousel_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carousel_name TEXT NOT NULL CHECK (carousel_name IN ('recent_works', 'highlights', 'returning_customers', 'tailor_jobs')),
  work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carousel_items_name ON carousel_items(carousel_name);

ALTER TABLE carousel_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read carousel_items" ON carousel_items FOR SELECT USING (true);
CREATE POLICY "Allow auth manage carousel_items" ON carousel_items FOR ALL USING (auth.role() = 'authenticated');

-- Optional: add subcategory_id to work_items (nullable, for optional subcategory assignment)
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
