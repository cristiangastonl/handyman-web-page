-- ─── New tables for Phase 2 ───

-- Site config: key/value store for editable text
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Seed defaults
INSERT INTO site_config (key, value) VALUES
  ('hero_title', 'Professional Handyman Services in Zürich'),
  ('hero_subtitle', 'Proudly serving Zürich''s international community'),
  ('brand_subtitle', 'Specialist Technician At Domestic Matters'),
  ('highlights_title', 'Highlights')
ON CONFLICT (key) DO NOTHING;

-- Subcategories under each category
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  header_image TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Highlights carousel items
CREATE TABLE IF NOT EXISTS highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Facebook reviews (manually curated)
CREATE TABLE IF NOT EXISTS facebook_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT DEFAULT 5,
  text TEXT NOT NULL,
  review_date TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS but allow anon read
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Allow anon read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Allow anon read highlights" ON highlights FOR SELECT USING (true);
CREATE POLICY "Allow anon read facebook_reviews" ON facebook_reviews FOR SELECT USING (true);

-- Allow authenticated users to manage
CREATE POLICY "Allow auth manage site_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage subcategories" ON subcategories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage highlights" ON highlights FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage facebook_reviews" ON facebook_reviews FOR ALL USING (auth.role() = 'authenticated');
