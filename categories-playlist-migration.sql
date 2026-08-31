-- Playlists de YouTube a nivel categoría.
--
-- Hasta ahora sólo las subcategorías podían apuntar a una playlist. Anibal pidió
-- lo mismo para las categorías en la ronda del 31/08/2026: "Agregar playlist a
-- las categorías también (hoy tiene solo para subcategorias)".
--
-- La columna es nullable a propósito: una categoría sin playlist simplemente no
-- muestra el link ni el badge, igual que hoy hacen las subcategorías.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS playlist_id text;

COMMENT ON COLUMN categories.playlist_id IS
  'ID de la playlist de YouTube, o la URL entera: playlistUrl() en src/lib/constants.js normaliza las dos formas.';
