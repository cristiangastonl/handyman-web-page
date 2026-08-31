-- Orden de las categorías del Portfolio (y de los tags de la presentación, que
-- salen de la misma tabla).
--
-- Pedido de Anibal, ronda del 31/08/2026: "botones con el orden luces, mounting,
-- assambly, paiting, plumbing, baby". Los nombres de acá son los reales, leídos
-- del sitio publicado, no los del pedido.
--
-- En la práctica se mueve una sola: Mounting pasa del puesto 5 al 2 y las tres
-- del medio bajan un lugar.
--
-- Se matchea por label y no por id porque los ids se generan a partir del nombre
-- y no son estables si alguna vez se renombró la categoría. Baby va con LIKE: su
-- nombre lleva viñetas Unicode ("Baby • Kids • Their World") que se rompen fácil
-- al copiar y pegar entre editores.

UPDATE categories SET sort_order = 1 WHERE label = 'All About Lighting';
UPDATE categories SET sort_order = 2 WHERE label = 'Mounting';
UPDATE categories SET sort_order = 3 WHERE label = 'Assembly';
UPDATE categories SET sort_order = 4 WHERE label = 'Painting';
UPDATE categories SET sort_order = 5 WHERE label = 'Plumbing';
UPDATE categories SET sort_order = 6 WHERE label LIKE 'Baby%';

-- Para verificar que quedó bien:
--   SELECT sort_order, label FROM categories ORDER BY sort_order;
