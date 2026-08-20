-- ═══════════════════════════════════════════════════════════════
-- Happy Customers — tabla propia
-- Correr en el SQL Editor de Supabase (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════
--
-- Por qué una tabla aparte y no work_items:
--
-- Estas fotos NO son portfolio. Son piezas ya compuestas por Anibal (selfie con
-- el cliente, marco decorativo, texto y logo quemados en la imagen). No tienen
-- categoría ni subcategoría, y meterlas en work_items las haría aparecer sí o sí
-- en /portfolio: Portfolio.jsx filtra por `cat` y work_items no tiene ninguna
-- columna de visibilidad para excluirlas.
--
-- Por eso carousel_items tampoco sirve acá: apunta a work_items por FK. El valor
-- 'happy_customers' del CHECK de carousel_items queda sin uso, pero no se toca
-- para no romper nada.

CREATE TABLE IF NOT EXISTS happy_customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src         text NOT NULL,
  -- El texto de la foto está en los píxeles, así que sin esto la imagen es muda
  -- para lectores de pantalla y para Google. Es el `alt` del <img>.
  alt_text    text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS happy_customers_sort_idx ON happy_customers (sort_order);

ALTER TABLE happy_customers ENABLE ROW LEVEL SECURITY;

-- Mismas políticas que el resto de las tablas: el sitio lee con la anon key,
-- solo el admin autenticado escribe.
DROP POLICY IF EXISTS "Allow anon read happy_customers" ON happy_customers;
CREATE POLICY "Allow anon read happy_customers" ON happy_customers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow auth manage happy_customers" ON happy_customers;
CREATE POLICY "Allow auth manage happy_customers" ON happy_customers
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── Verificación ───
-- Debe devolver las 5 columnas
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'happy_customers' ORDER BY ordinal_position;

-- Debe devolver las 2 políticas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'happy_customers';
