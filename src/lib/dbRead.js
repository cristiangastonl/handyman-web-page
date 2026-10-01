/**
 * Lecturas que no se cortan solas.
 *
 * PostgREST tiene un techo de filas por respuesta (`db-max-rows`, 1000 en
 * Supabase). Al pasarlo no devuelve error ni avisa: contesta 200 con las
 * primeras 1000 y listo. Con el patrón que usaba supabase.js
 * —`.select("*").order("sort_order")` sin rango— eso llegaba como una lista
 * completa y perfectamente válida a la que le faltaban filas.
 *
 * Así desaparecieron las fotos que Anibal subió a "All About Lighting →
 * IKEA Lights" la mañana del 01/10/2026: work_items tenía 1018 filas, la app
 * veía 1000, y las 18 que quedaban afuera eran justo las de esa subcategoría
 * porque son las de sort_order más alto de toda la tabla. Cada foto nueva
 * entraba con sort_order = max(hermanas) + 1, o sea todavía más al final, o sea
 * invisible también. Subía, se guardaba bien en la base y en el storage, y no
 * aparecía en ningún lado. Probó con jpg y con png pensando que era el archivo.
 *
 * El uploader nunca tuvo nada. El bug estaba en la lectura.
 */

export const TAMANO_PAGINA = 1000;

// Tope de seguridad: si el server ignorara el rango y devolviera siempre lo
// mismo, esto corta en vez de colgar el navegador pidiendo páginas para siempre.
const MAX_FILAS = 50000;

export const seCorto = (filas) =>
  `la lectura superó ${filas} filas y se cortó por las dudas. ` +
  `O la tabla creció muchísimo, o el servidor está ignorando el rango pedido.`;

/**
 * Trae TODAS las filas de una query, en páginas, hasta que no quede ninguna.
 *
 * El cursor avanza por la cantidad de filas que realmente llegaron, no por el
 * tamaño de página pedido. Es a propósito: si el techo del servidor fuera más
 * bajo que `tamanoPagina`, mirar "¿vino una página incompleta?" daría por
 * terminada la lectura en la primera vuelta y volveríamos a truncar en silencio,
 * que es exactamente el bug que esto viene a arreglar. Sólo una página vacía
 * significa que no hay más.
 *
 * `hacerQuery` tiene que devolver un orden ESTABLE —con desempate único, por
 * ejemplo `.order("sort_order").order("id")`—. Si dos filas pueden quedar
 * empatadas, Postgres es libre de ordenarlas distinto en cada página y una fila
 * puede salir repetida en una y faltar en la otra.
 *
 * @param hacerQuery  (desde, hasta) => query de supabase-js ya con .range()
 */
export async function traerTodas(hacerQuery, { tamanoPagina = TAMANO_PAGINA } = {}) {
  const filas = [];
  while (filas.length < MAX_FILAS) {
    const { data, error } = await hacerQuery(filas.length, filas.length + tamanoPagina - 1);
    if (error) throw error;
    if (!data || data.length === 0) return filas;
    filas.push(...data);
  }
  throw new Error(seCorto(MAX_FILAS));
}
