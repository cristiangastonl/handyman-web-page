-- ═══════════════════════════════════════════════════════════════
-- Handyman Zurich — Complete Supabase Setup + Seed Data
-- Run this in the Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Site config: key/value store ───
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ─── 2. Subcategories under each category ───
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  header_image TEXT,
  playlist_id TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. Highlights carousel items ───
CREATE TABLE IF NOT EXISTS highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. Facebook reviews (manually curated) ───
CREATE TABLE IF NOT EXISTS facebook_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT DEFAULT 5,
  text TEXT NOT NULL,
  review_date TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. Google reviews (manually curated) ───
CREATE TABLE IF NOT EXISTS google_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  time_label TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Anon read
CREATE POLICY "Allow anon read site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Allow anon read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Allow anon read highlights" ON highlights FOR SELECT USING (true);
CREATE POLICY "Allow anon read facebook_reviews" ON facebook_reviews FOR SELECT USING (true);
CREATE POLICY "Allow anon read google_reviews" ON google_reviews FOR SELECT USING (true);

-- Auth manage
CREATE POLICY "Allow auth manage site_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage subcategories" ON subcategories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage highlights" ON highlights FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage facebook_reviews" ON facebook_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth manage google_reviews" ON google_reviews FOR ALL USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- Seed Data
-- ═══════════════════════════════════════════════════════════════

-- ─── Site Config ───
INSERT INTO site_config (key, value) VALUES
  ('hero_title', 'Professional Handyman Services in Zürich'),
  ('hero_subtitle', 'Proudly serving Zürich''s international community'),
  ('brand_subtitle', 'Specialist Technician At Domestic Matters'),
  ('highlights_section_title', 'Highlights'),
  ('photos_section_title', 'Photos'),
  ('videos_section_title', 'Videos'),
  ('bio_intro', 'Meet Your Handyman'),
  ('bio_text', 'With years of experience serving Zürich''s international community, I provide reliable, high-quality handyman services. From IKEA assembly to electrical work, plumbing, painting, and more — I''m here to help make your home perfect.'),
  ('expat_message', 'English-speaking handyman in Zürich — making home services easy for the international community 🌍'),
  ('phone', '+41 76 594 95 81'),
  ('whatsapp_url', 'https://wa.me/41765949581?text=Hi%2C%20I%20need%20a%20handyman%20in%20Zurich'),
  ('facebook_url', 'https://www.facebook.com/HandymanServicesinZurich'),
  ('youtube_url', 'https://www.youtube.com/@HandymanServicesinZurich')
ON CONFLICT (key) DO NOTHING;

-- ─── Facebook Reviews (real) ───
INSERT INTO facebook_reviews (name, rating, text, review_date, sort_order) VALUES
  ('Lidia Profir', 5, 'I totally recommend Anibal. He is very polite, he immediately responded to my request of installing lights in a new appartment, I was really happy with the work he did. He''s very friendly and I appreciated his communication skills very much. For me it was a real plus he speaks English very well as I don''t speak German too much. Don''t hesitate to contact him, you''ll be surprised by his work and the interaction with him. Thanks Anibal!', '2025', 1),
  ('Lu Mo', 5, 'Anibal fitted our Samsung frame, some lights, mounted several pictures. He was pleasant, professional and very thorough.', '2025', 2),
  ('Diana Ursachi', 5, 'Anibal installed a Tesla charging station in the garage and it worked perfectly ever since. I wholeheartedly recommend his services!', '2025', 3),
  ('Vanessa Kitić', 5, 'Anibal was such a pro in installing the Philips smart lighting fixtures in my living and dining spaces. He was able to advise on the height and created a seamless solution for a once off center wiring issue that now looks perfectly centered over my dining table. The whole service was flawless, and not a speck of dust was left behind. I recommend Anibal for truly anything you may need done in your home. He is so precise, professional, and friendly.', '2025', 4),
  ('Kamel Ghosn', 5, 'Great communication, service and price. Anibal did a great job hanging a TV and moving a light. Thank you', '2025', 5),
  ('Heather Halsey', 5, 'Aníbal did a great job. He has good attention to detail and checks with me that I was happy with the position of a hanging light. The clean up was immaculate as well. We are very happy with the work and will definitely contact him when we have more jobs around the house.', '2025', 6),
  ('Catherine Grau', 5, 'Ausgezeichnete Arbeit, ich empfehle Euch allen Herrr Handyman. Excelente trabajo 10+, recomiendo ampliamente los servicios del Sr. Handyman.', '2025', 7),
  ('Paco Olivares', 5, 'Excelente Servicio 5 estrellas y 3 diamantes! Fueron instalaciones de lámparas con problemas de conexión. Todo quedó al 100%', '2025', 8),
  ('Sissi Schulz', 5, 'I can definitely recommend the "Handyman Services" aka Aníbal. I needed some lights installed in my new flat, with ceiling drilling and all. He did an amazing job! Every light was precisely placed with some Laser technology which helped putting them exactly in one line as they were three lights in a row. They are also placed exactly in the centre of the ceiling as I wanted. He worked cleanly but at the same time was very efficient, it couldn''t have been done better. Booking was very easy and he was very punctual. The price given was fair and he shared his knowledge of some other stuff that could help improve my flat, which I really appreciated. All in all I am super happy with the service he provided and would definitively book him again for anything else that needs doing in the flat.', '2025', 9),
  ('Natalia Lucas', 5, 'Just wanted to recommend Handyman Services in Zurich, for his truly amazing work! Today he installed two lamps (one he suggested, and I LOVE it!), fixed a poorly done wall, and mounted a super tricky wall hanger perfectly. Thank you so much! What really stands out is his precision, honesty, and great advice. He knows his craft, works with top-quality tools, and makes everything easy and stress-free. His service is his passion! He knows about the new products and technologies in the market. If you need someone, you can fully trust for electrical work or home repairs, Handyman''s the one to call!', '2025', 10),
  ('Karen Orozco', 5, 'Hace unas semanas, Aníbal vino a casa e instaló los rieles para cortinas en cuatro ventanales, además de la iluminación de nuestra sala. ¡Queremos destacar su profesionalismo y la excelente calidad de su trabajo! Estamos súper contentos con el resultado! Súper recomendado 🙌🏽', '2025', 11)
ON CONFLICT DO NOTHING;

-- ─── Subcategories with real YouTube playlist IDs ───
INSERT INTO subcategories (category_id, name, playlist_id, sort_order) VALUES
  -- Lighting
  ('lighting', 'IKEA Lights', 'PLO8avQ6ndCk9B1qC4DTjggn9AlvwCtkLi', 1),
  ('lighting', 'Philips Hue', 'PLO8avQ6ndCk-s3w5hPWd3iPH44t503EA7', 2),
  ('lighting', 'General Lights', 'PLO8avQ6ndCk-snHIM5I2beUow-VlCgn9O', 3),
  -- Assembly & Mounting
  ('assembly', 'Mirrors', 'PLO8avQ6ndCk9KMGyZJ5JdfZjw0vkRxSH-', 4),
  ('assembly', 'Shelves', 'PLO8avQ6ndCk-iPglKXcbpDfqbQHxgAdHs', 5),
  ('assembly', 'Frames', 'PLO8avQ6ndCk9Bl5hBCYBwL71Rz5MwWpeS', 6),
  ('assembly', 'TV Mounting', 'PLO8avQ6ndCk_FcH3mjN9fbyzoQnZ4-FYC', 7),
  ('assembly', 'IKEA Furniture', 'PLO8avQ6ndCk8vyO4kGwdP_x8IThvFZ7wQ', 8),
  ('assembly', 'General Montages', 'PLO8avQ6ndCk-Rp3eYJXzFYZ626urhpasp', 9),
  ('assembly', 'Furniture Assembly', 'PLO8avQ6ndCk-p5AXCHOHtKr7ZgKeJ6tL8', 10),
  -- Painting
  ('painting', 'Painting', 'PLO8avQ6ndCk9GKavzXZem8A3vRlUVYpmv', 11),
  -- Plumbing & Repairs
  ('plumbing', 'General Plumbing', 'PLO8avQ6ndCk86X3zUKICgwQE5Ad8xawzJ', 12),
  ('plumbing', 'Home Repairs', 'PLO8avQ6ndCk-htSNr6gAPpUe5hDpBFGZg', 13),
  -- Baby & Kids
  ('kids', 'Baby & Kid Rooms', 'PLO8avQ6ndCk9DwgMGO7W8dyeYcq6oMSla', 14)
ON CONFLICT DO NOTHING;

-- ─── Google Reviews (from existing REVIEWS constant) ───
INSERT INTO google_reviews (name, rating, text, time_label, sort_order) VALUES
  ('Anna M.', 5, 'Outstanding service! Our bathroom looks brand new. Very professional and punctual. Will definitely call again for future projects.', '2 weeks ago', 1),
  ('Thomas K.', 5, 'Assembled our entire IKEA kitchen in one day. Perfect work. Highly recommended!', '1 month ago', 2),
  ('Sarah L.', 4, 'Quick response and great electrical work. Fair prices for the Zurich area. Very clean and tidy.', '1 month ago', 3),
  ('Marco R.', 5, 'Third time hiring — always top quality. Best handyman in Zurich! Friendly, on time, and does excellent work.', '2 months ago', 4),
  ('Lisa W.', 5, 'Our new parquet floor is beautiful. Impressive attention to detail and very reasonable pricing.', '3 months ago', 5),
  ('Peter H.', 5, 'Reliable and honest. Fixed multiple things in one visit. Great value for money.', '3 months ago', 6),
  ('Julia B.', 5, 'Mounted our TV and installed floating shelves perfectly. Very careful with the walls. Cleaned everything after. Top!', '4 months ago', 7),
  ('Daniel F.', 5, 'Emergency plumbing fix on a Saturday. Arrived within 2 hours. Lifesaver! Fair price even for weekend work.', '4 months ago', 8),
  ('Nina S.', 4, 'Painted our entire apartment in 3 days. Neat work, protected all furniture. Good communication throughout.', '5 months ago', 9),
  ('Robert M.', 5, 'Built custom shelving in our office. Measured everything perfectly, looks like it was always there. Highly professional.', '5 months ago', 10),
  ('Elena K.', 5, 'Garden maintenance and new lighting installation. Transformed our outdoor space completely. So happy with the result!', '6 months ago', 11),
  ('Stefan W.', 5, 'Fixed a leaking faucet and installed a new bathroom mirror. Quick, efficient, and very friendly. Recommended to all my neighbors.', '6 months ago', 12)
ON CONFLICT DO NOTHING;
