/**
 * Escrituras que no pueden mentir.
 *
 * PostgREST no devuelve error cuando RLS descarta todas las filas de un UPDATE o
 * un DELETE: contesta 200 con cero filas. Con el patrón que usaba supabase.js
 * —`const { error } = await ...update(...)`— eso llegaba como `error: null`, y el
 * admin mostraba el toast de guardado sobre algo que nunca se guardó.
 *
 * Así se perdió en silencio la playlist que Anibal le puso a "Assembly" el
 * 01/09/2026: la tabla categories nunca tuvo política de escritura (ver
 * rls-categories-migration.sql). El toast salía, la base no cambiaba, y al
 * recargar el admin la playlist no estaba.
 *
 * Los INSERT no necesitan esto: cuando RLS los bloquea sí devuelven error
 * (42501, "new row violates row-level security policy").
 */

export const sinFilas = (queHacia) =>
  `${queHacia}: la base aceptó la operación pero no cambió ninguna fila. ` +
  `Suele ser RLS bloqueando la escritura, o la sesión del admin vencida — ` +
  `probá cerrar sesión y volver a entrar.`;

/**
 * Corre una escritura y falla si no tocó ninguna fila.
 *
 * Se le encadena `.select()` a la query para que PostgREST devuelva las filas
 * afectadas; sin eso no hay forma de distinguir "actualicé" de "no me dejaron".
 *
 * @param query  el query builder de supabase-js, sin `.select()` todavía
 * @param queHacia  qué se estaba haciendo, para el mensaje de error
 */
export async function escribir(query, queHacia) {
  const { data, error } = await query.select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error(sinFilas(queHacia));
  return data;
}
