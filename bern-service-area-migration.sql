-- ═══════════════════════════════════════════════════════════════
-- Agrega Bern a las zonas de servicio
-- ═══════════════════════════════════════════════════════════════
--
-- Pedido de Anibal por WhatsApp el 29/08/2026: "Agregame Berna, el miercoles 9
-- voy" — y marcó los dos lugares donde aparece la lista (el bloque naranja de
-- Service Areas y el pie de página).
--
-- Los dos leen del mismo lugar: site_config.site_service_areas, un único string
-- separado por " · ". Con este UPDATE se actualizan los dos de una.
--
-- Bern va después de Lucerne: la lista arranca por los cantones más cercanos a
-- Zurich y sigue por los grandes, así que ahí es donde cae.
--
-- Correr en: Supabase → SQL Editor → New query → Run.

-- Cómo está ahora (para tenerlo a mano por si hay que volver atrás).
SELECT value AS antes FROM site_config WHERE key = 'site_service_areas';

-- El cambio. Es un UPSERT: si por lo que sea la fila no existiera, la crea.
INSERT INTO site_config (key, value)
VALUES (
  'site_service_areas',
  'Zurich · Zug · St. Gallen · Lucerne · Bern · Basel · Schwyz · Aargau · Schaffhausen · Uri · Obwalden · Nidwalden · Glarus · Solothurn · Thurgau'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Cómo quedó. Tiene que decir 15 zonas, con Bern entre Lucerne y Basel.
SELECT
  value AS despues,
  array_length(string_to_array(value, ' · '), 1) AS cantidad_de_zonas,
  value LIKE '%Bern%' AS tiene_bern
FROM site_config
WHERE key = 'site_service_areas';
