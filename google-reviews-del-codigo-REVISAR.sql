-- NO CORRER SIN LEER. Son las reseñas de Google que estaban en el código.
--
-- Vivían en REVIEWS (src/lib/constants.js) y se mostraban cuando la tabla
-- google_reviews quedaba vacía. Eso pasó el 03/09/2026: Anibal borró las suyas
-- desde el admin y el sitio siguió publicando estas como si fueran de clientes
-- reales, con un promedio de 4.3 calculado sobre ellas.
--
-- A diferencia de las de Facebook, estas parecen datos de relleno: nombres con
-- inicial ("Anna M.", "Thomas K."), textos genéricos y fechas relativas ("2 weeks
-- ago") en vez de fechas reales. Por eso NO se cargan solas.
--
-- Este archivo existe para poder mirarlas y decidir. Si alguna es de un cliente
-- de verdad, se descomenta y se corre. Si no, se borra el archivo: el sitio ya
-- no las muestra.

/*
INSERT INTO google_reviews (name, rating, text, time_label) VALUES
  ('Anna M.', 5, 'Outstanding service! Our bathroom looks brand new. Very professional and punctual. Will definitely call again for future projects.', '2 weeks ago'),
  ('Thomas K.', 5, 'Assembled our entire IKEA kitchen in one day. Perfect work. Highly recommended!', '1 month ago'),
  ('Sarah L.', 4, 'Quick response and great electrical work. Fair prices for the Zurich area. Very clean and tidy.', '1 month ago'),
  ('Marco R.', 5, 'Third time hiring \u2014 always top quality. Best handyman in Zurich! Friendly, on time, and does excellent work.', '2 months ago'),
  ('Lisa W.', 5, 'Our new parquet floor is beautiful. Impressive attention to detail and very reasonable pricing.', '3 months ago'),
  ('Peter H.', 5, 'Reliable and honest. Fixed multiple things in one visit. Great value for money.', '3 months ago'),
  ('Julia B.', 5, 'Mounted our TV and installed floating shelves perfectly. Very careful with the walls. Cleaned everything after. Top!', '4 months ago'),
  ('Daniel F.', 5, 'Emergency plumbing fix on a Saturday. Arrived within 2 hours. Lifesaver! Fair price even for weekend work.', '4 months ago'),
  ('Nina S.', 4, 'Painted our entire apartment in 3 days. Neat work, protected all furniture. Good communication throughout.', '5 months ago'),
  ('Robert M.', 5, 'Built custom shelving in our office. Measured everything perfectly, looks like it was always there. Highly professional.', '5 months ago'),
  ('Elena K.', 5, 'Garden maintenance and new lighting installation. Transformed our outdoor space completely. So happy with the result!', '6 months ago'),
  ('Stefan W.', 5, 'Fixed a leaking faucet and installed a new bathroom mirror. Quick, efficient, and very friendly. Recommended to all my neighbors.', '6 months ago');
*/
