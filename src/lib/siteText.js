import { parseSiteText } from "./constants";

/**
 * Qué muestra y qué guarda un campo de texto editable del admin.
 *
 * Vive acá y no adentro del componente por dos razones: la lógica tiene una
 * decisión real —cuándo NO guardar el texto— y no hay forma de testear un
 * componente en este proyecto.
 */

/**
 * El texto que el campo tiene que traer cargado: lo guardado, y si no hay nada,
 * el default (que es lo que la página está mostrando via i18n).
 *
 * Antes el campo arrancaba vacío con el texto actual de `placeholder`. Se leía
 * igual pero no se podía editar, sólo reemplazar entero escribiendo de cero.
 * Anibal lo reportó como "este no me deja editarlo" (02/09/2026), con una
 * captura del campo lleno de texto — porque eso es exactamente lo que parece.
 */
export function textoVigente(currentValue, def) {
  const guardado = parseSiteText(currentValue) || {};
  return guardado.text || def?.defaultText || "";
}

/**
 * Lo que se manda a site_config.
 *
 * La clave está en `text`: si quedó igual al default, no se manda. Lo guardado
 * le gana a la traducción, así que grabar el texto en inglés sin querer —por
 * ejemplo al tocar sólo el tamaño de letra, con el campo precargado— dejaría a
 * los otros 4 idiomas mostrando inglés. Se guarda sólo lo que se cambió.
 *
 * Los campos vacíos se omiten en vez de ir como undefined: JSON.stringify los
 * borraría igual, pero así el objeto que se devuelve es el que se guarda y se
 * puede afirmar sobre él en un test.
 */
export function payloadSiteText({ text, fontSize, fontFamily }, def) {
  const igualAlDefault = (text || "").trim() === (def?.defaultText || "").trim();
  const val = {};
  if (!igualAlDefault && text) val.text = text;
  if (fontSize) val.fontSize = Number(fontSize);
  if (fontFamily) val.fontFamily = fontFamily;
  return val;
}
