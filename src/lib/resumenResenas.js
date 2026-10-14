/**
 * Qué estilo usa el resumen de /reviews (5.0 de Google, 100% de Facebook).
 *
 * "clasico": números grandes sueltos, como lo pidió Anibal el 13/10/2026.
 * "tarjetas": cada fuente en su tarjeta, números más chicos y una píldora
 * "Recommended" debajo del 100% (propuesta de Gastón, 14/10/2026).
 *
 * Por defecto va "tarjetas" (decisión de Gastón, 14/10/2026: "si a Anibal no le
 * gusta lo volvemos para atrás"). Se elige desde el admin
 * (site_config.reviews_summary_style) para poder volver al clásico con un click,
 * sin deploy. `?resumen=tarjetas` en la URL lo pisa
 * sólo para quien abre ese link: sirve para mostrarlo antes de activarlo.
 */
export const ESTILOS_RESUMEN = ["clasico", "tarjetas"];

export function estiloResumen(siteConfig = {}, search = "") {
  const pedido = new URLSearchParams(search).get("resumen");
  if (ESTILOS_RESUMEN.includes(pedido)) return pedido;
  const guardado = siteConfig.reviews_summary_style;
  return ESTILOS_RESUMEN.includes(guardado) ? guardado : "tarjetas";
}
