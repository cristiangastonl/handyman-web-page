-- Políticas de RLS que nunca se crearon: categories, work_items y faqs.
--
-- Síntoma (01/09/2026): Anibal le puso una playlist a "Assembly" desde el admin,
-- vio el toast de guardado, y al recargar no estaba. Tampoco en el sitio.
--
-- Causa: supabase-setup.sql habilita RLS y crea políticas para site_config,
-- subcategories, highlights, facebook_reviews y google_reviews — y las
-- migraciones de carousel_items y happy_customers traen las suyas. Pero
-- categories, work_items y faqs nunca tuvieron ninguna en el repo. Con RLS
-- prendido y sin política de escritura, PostgREST devuelve 200 con cero filas
-- en vez de un error, así que el admin lo festejaba como éxito.
-- (Verificado desde afuera: PATCH a /categories con la clave anónima devuelve
-- 200 y [] — cero filas afectadas — mientras el GET a la misma tabla anda.)
--
-- Es idempotente: se puede correr las veces que haga falta.

ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs        ENABLE ROW LEVEL SECURITY;

-- Lectura pública: es el contenido del sitio, lo tiene que ver cualquiera.
DROP POLICY IF EXISTS "Allow anon read categories" ON categories;
CREATE POLICY "Allow anon read categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read work_items" ON work_items;
CREATE POLICY "Allow anon read work_items" ON work_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read faqs" ON faqs;
CREATE POLICY "Allow anon read faqs" ON faqs
  FOR SELECT USING (true);

-- Escritura sólo con sesión iniciada, igual que el resto de las tablas.
DROP POLICY IF EXISTS "Allow auth manage categories" ON categories;
CREATE POLICY "Allow auth manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow auth manage work_items" ON work_items;
CREATE POLICY "Allow auth manage work_items" ON work_items
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow auth manage faqs" ON faqs;
CREATE POLICY "Allow auth manage faqs" ON faqs
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Para verificar que quedó bien ──
-- Tienen que salir 2 filas por tabla (SELECT para anon, ALL para authenticated):
--
--   SELECT tablename, policyname, cmd, roles
--   FROM pg_policies
--   WHERE tablename IN ('categories', 'work_items', 'faqs')
--   ORDER BY tablename, cmd;
--
-- Y después, desde el admin, guardar una playlist en una categoría y recargar.
