/**
 * Vista previa de los links del portfolio para WhatsApp, Facebook, Telegram, etc.
 *
 * vercel.json manda acá los pedidos de /portfolio/... que hacen esos robots (se
 * reconocen por el user-agent) y le pasa el camino en ?ruta=. Los visitantes nunca
 * llegan acá. Busca en la base la categoría, la subcategoría y la foto del link, y
 * responde un HTML mínimo con og:title / og:image (ver src/lib/vistaPrevia.js).
 *
 * Si algo falla responde igual, con la vista previa genérica del sitio: un link
 * compartido nunca tiene que quedar sin vista previa por un error de la base.
 */
import { leerRutaPortfolio } from "../src/lib/portfolioRutas.js";
import { datosVistaPrevia, htmlVistaPrevia } from "../src/lib/vistaPrevia.js";
import { SITE_ORIGIN } from "../src/lib/constants.js";

async function leer(consulta) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/${consulta}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  return res.ok ? res.json() : [];
}

export default async function handler(req, res) {
  const pedido = new URL(req.url, SITE_ORIGIN);
  // ?ruta= lo pone la regla de vercel.json; ?path= lo agrega Vercel solo, con el
  // mismo valor. Ninguno de los dos es parte del link que se compartió.
  const camino = (pedido.searchParams.get("ruta") || pedido.searchParams.get("path") || "").trim();
  const ruta = `/portfolio/${camino}`;
  pedido.searchParams.delete("ruta");
  pedido.searchParams.delete("path");
  const search = pedido.searchParams.toString();
  const url = `${SITE_ORIGIN}${ruta.replace(/\/+$/, "")}${search ? `?${search}` : ""}`;

  let datos;
  try {
    const [cats, subcats] = await Promise.all([
      leer("categories?select=id,label,header_image"),
      leer("subcategories?select=id,name,category_id,header_image"),
    ]);
    const { cat, subcat, foto } = leerRutaPortfolio(ruta, search, cats, subcats);
    const campos = "select=id,type,src,thumb,video_id,title,description";
    const item = foto && /^\d+$/.test(foto) ? (await leer(`work_items?${campos}&id=eq.${foto}`))[0] || null : null;
    // Sin foto ni cabecera, la primera foto del nivel.
    let primera = null;
    const tieneCabecera = subcat ? subcat.header_image : cat?.header_image;
    if (!item && cat && !tieneCabecera) {
      const filtro = subcat ? `subcategory_id=eq.${subcat.id}` : `cat=eq.${encodeURIComponent(cat.id)}`;
      primera = (await leer(`work_items?${campos}&${filtro}&type=eq.image&order=sort_order.asc&limit=1`))[0] || null;
    }
    datos = datosVistaPrevia({ cat, subcat, item, primera, url });
  } catch (e) {
    console.error("vista-previa:", e.message);
    datos = datosVistaPrevia({ url });
  }

  // Quién pidió y qué recibió: para diagnosticar una vista previa que no aparece
  // (22/10/2026, WhatsApp mostró la tarjeta pelada). Se ve en los logs de Vercel.
  console.log(JSON.stringify({ ua: req.headers["user-agent"] || "", url, titulo: datos.titulo, imagen: datos.imagen }));

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex");
  // Lo cachea el CDN de Vercel: el mismo link pegado en varios chats no vuelve a
  // pedirle nada a Supabase durante una hora.
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(htmlVistaPrevia(datos));
}
