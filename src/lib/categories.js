/**
 * Las categorías del Portfolio, como las consume la app.
 *
 * Existe por un bug que costó dos rondas de ida y vuelta con Anibal: App.jsx
 * armaba el estado con `dbCats.map(c => ({ id, label, header_image }))`, o sea
 * se quedaba con tres columnas y descartaba el resto de la fila. Cuando se
 * agregó `playlist_id` a la tabla (categories-playlist-migration.sql) se
 * escribió desde el admin y se leyó en Portfolio.jsx, pero nunca sobrevivía el
 * viaje: la columna se perdía acá en el medio. El síntoma era que la playlist
 * se guardaba bien en la base y aun así no aparecía ni el badge ▶ en la tarjeta
 * ni el link adentro de la categoría — y en el admin el ▶ seguía gris.
 *
 * Por eso la fila pasa entera y no campo por campo: cualquier columna que se le
 * agregue a `categories` llega sola a los componentes, sin tener que acordarse
 * de sumarla a una lista acá.
 */

/** La categoría sintética "All" del Portfolio, que no vive en la base. */
export const ALL_CATEGORY = { id: "all", label: "All" };

/**
 * @param {Array} dbCats  filas de la tabla `categories`, tal cual vienen
 * @returns {Array} las categorías con "All" adelante
 */
export function withAllCategory(dbCats = []) {
  return [ALL_CATEGORY, ...dbCats];
}
