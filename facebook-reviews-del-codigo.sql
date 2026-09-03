-- Las 11 reseñas de Facebook que vivían en el código y no en la base.
--
-- Estaban en DEFAULT_FB_REVIEWS (src/lib/constants.js) como estado inicial de
-- fbReviews: se veían el instante que tarda Supabase en responder y después las
-- pisaban las 145 de la base. En la práctica no estaban publicadas.
--
-- Al sacarlas del código el 03/09/2026 se comprobó una por una contra la base:
-- 8 ya estaban cargadas y 3 no (Catherine Grau, Paco Olivares, Sissi Schulz).
-- Van las 11 igual, porque el INSERT no duplica: compara por texto y sólo entra
-- lo que falta. Así quedan todas en el admin y Anibal decide cuáles publica.
--
-- Correr en el SQL editor de Supabase. Se puede correr las veces que haga falta.

INSERT INTO facebook_reviews (name, rating, text, review_date)
SELECT * FROM (VALUES
  -- Lidia Profir  (ya estaba en la base)
  ('Lidia Profir', 5, 'I totally recommend Anibal. He is very polite, he immediately responded to my request of installing lights in a new appartment, I was really happy with the work he did. He''s very friendly and I appreciated his communication skills very much. For me it was a real plus he speaks English very well as I don''t speak German too much. Don''t hesitate to contact him, you''ll be surprised by his work and the interaction with him. Thanks Anibal!', '2025'),
  -- Lu Mo  (ya estaba en la base)
  ('Lu Mo', 5, 'Anibal fitted our Samsung frame, some lights, mounted several pictures. He was pleasant, professional and very thorough.', '2025'),
  -- Diana Ursachi  (ya estaba en la base)
  ('Diana Ursachi', 5, 'Anibal installed a Tesla charging station in the garage and it worked perfectly ever since. I wholeheartedly recommend his services!', '2025'),
  -- Vanessa Kitić  (ya estaba en la base)
  ('Vanessa Kitić', 5, 'Anibal was such a pro in installing the Philips smart lighting fixtures in my living and dining spaces. He was able to advise on the height and created a seamless solution for a once off center wiring issue that now looks perfectly centered over my dining table. The whole service was flawless, and not a speck of dust was left behind. I recommend Anibal for truly anything you may need done in your home. He is so precise, professional, and friendly.', '2025'),
  -- Kamel Ghosn  (ya estaba en la base)
  ('Kamel Ghosn', 5, 'Great communication, service and price. Anibal did a great job hanging a TV and moving a light. Thank you', '2025'),
  -- Heather Halsey  (ya estaba en la base)
  ('Heather Halsey', 5, 'Aníbal did a great job. He has good attention to detail and checks with me that I was happy with the position of a hanging light. The clean up was immaculate as well. We are very happy with the work and will definitely contact him when we have more jobs around the house.', '2025'),
  -- Catherine Grau  ← FALTABA
  ('Catherine Grau', 5, 'Ausgezeichnete Arbeit, ich empfehle Euch allen Herrr Handyman. Excelente trabajo 10+, recomiendo ampliamente los servicios del Sr. Handyman.', '2025'),
  -- Paco Olivares  ← FALTABA
  ('Paco Olivares', 5, 'Excelente Servicio 5 estrellas y 3 diamantes! Fueron instalaciones de lámparas con problemas de conexión. Todo quedó al 100%', '2025'),
  -- Sissi Schulz  ← FALTABA
  ('Sissi Schulz', 5, 'I can definitely recommend the "Handyman Services" aka Aníbal. I needed some lights installed in my new flat, with ceiling drilling and all. He did an amazing job! Every light was precisely placed with some Laser technology which helped putting them exactly in one line as they were three lights in a row. They are also placed exactly in the centre of the ceiling as I wanted. He worked cleanly but at the same time was very efficient, it couldn''t have been done better. Booking was very easy and he was very punctual. The price given was fair and he shared his knowledge of some other stuff that could help improve my flat, which I really appreciated. All in all I am super happy with the service he provided and would definitively book him again for anything else that needs doing in the flat.', '2025'),
  -- Natalia Lucas  (ya estaba en la base)
  ('Natalia Lucas', 5, 'Just wanted to recommend Handyman Services in Zurich, for his truly amazing work! Today he installed two lamps (one he suggested, and I LOVE it!), fixed a poorly done wall, and mounted a super tricky wall hanger perfectly. Thank you so much! What really stands out is his precision, honesty, and great advice. He knows his craft, works with top-quality tools, and makes everything easy and stress-free. His service is his passion! He knows about the new products and technologies in the market. If you need someone, you can fully trust for electrical work or home repairs, Handyman''s the one to call!', '2025'),
  -- Karen Orozco  (ya estaba en la base)
  ('Karen Orozco', 5, 'Hace unas semanas, Aníbal vino a casa e instaló los rieles para cortinas en cuatro ventanales, además de la iluminación de nuestra sala. ¡Queremos destacar su profesionalismo y la excelente calidad de su trabajo! Estamos súper contentos con el resultado! Súper recomendado 🙌🏽', '2025')
) AS nuevas(name, rating, text, review_date)
WHERE NOT EXISTS (
  SELECT 1 FROM facebook_reviews f WHERE f.text = nuevas.text
);

-- Para ver qué entró:
--   SELECT name, rating, review_date FROM facebook_reviews
--   WHERE name IN ('Catherine Grau', 'Paco Olivares', 'Sissi Schulz');
