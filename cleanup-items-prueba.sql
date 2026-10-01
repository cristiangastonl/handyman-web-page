-- Limpieza de los ítems de prueba que quedaron del 01/10/2026.
--
-- Anibal estuvo subiendo fotos a "All About Lighting → IKEA Lights" entre las
-- 08:01 y las 08:46 y no aparecían (ver src/lib/dbRead.js: work_items pasó las
-- 1000 filas y PostgREST recortaba la lectura sin avisar). Mientras probaba si
-- era el archivo, la extensión o qué, dejó estos 5 ítems con título de una letra.
-- Ahora que la lectura está paginada, se ven.
--
-- Las 5 filas están respaldadas antes de correr esto. Las imágenes quedan en el
-- bucket `images` (borrar la fila no borra el archivo): son 5 archivos huérfanos
-- de unos pocos MB, se pueden limpiar aparte desde Storage.
--
-- NO incluye el ítem id=81 ("ddd", 19/03/2026), que es un reel de Facebook y
-- puede ser un trabajo real con el título mal cargado. Ese decidilo vos.

begin;

-- Mirá qué vas a borrar antes de confirmar:
select id, title, description, cat, created_at
from work_items
where id in (1126, 1127, 1128, 1129, 1130);

delete from work_items
where id in (1126, 1127, 1128, 1129, 1130);

commit;
