-- Resumen del portfolio: una fila por (categoría, subcategoría).
--
-- El sitio público leía work_items entero al abrir cualquier ruta —incluida la
-- home— sólo para poder contar ítems y elegir una miniatura por tarjeta. Con
-- ~1000 filas eso son 2 requests y ~86 KB que crecen con cada foto que sube
-- Anibal. Ahora el listado de categorías lee esta vista (≈50 filas) y las fotos
-- se piden recién al entrar a una categoría o subcategoría.
--
-- subcategory_id NULL = ítems sueltos de la categoría (los "General").
--
-- first_* es el primer ítem del grupo en el mismo orden que usa el sitio
-- (sort_order, id): es la miniatura de respaldo cuando la categoría o
-- subcategoría no tiene header_image. Para la tarjeta de una categoría el
-- cliente toma el first_* de menor (sort_order, id) entre todos sus grupos.
--
-- security_invoker: la vista respeta las políticas RLS de work_items en vez de
-- correr con los permisos del dueño.

CREATE OR REPLACE VIEW work_items_summary
WITH (security_invoker = true) AS
SELECT
  g.cat,
  g.subcategory_id,
  g.total,
  g.photos,
  g.videos,
  f.id          AS first_id,
  f.sort_order  AS first_sort_order,
  f.type        AS first_type,
  f.src         AS first_src,
  f.thumb       AS first_thumb,
  f.video_id    AS first_video_id
FROM (
  SELECT
    cat,
    subcategory_id,
    count(*)                                              AS total,
    count(*) FILTER (WHERE type = 'image')                AS photos,
    count(*) FILTER (WHERE type IN ('video', 'facebook')) AS videos
  FROM work_items
  GROUP BY cat, subcategory_id
) g
CROSS JOIN LATERAL (
  SELECT w.id, w.sort_order, w.type, w.src, w.thumb, w.video_id
  FROM work_items w
  WHERE w.cat = g.cat
    AND w.subcategory_id IS NOT DISTINCT FROM g.subcategory_id
  ORDER BY w.sort_order, w.id
  LIMIT 1
) f;

GRANT SELECT ON work_items_summary TO anon, authenticated;
