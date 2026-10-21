import { useTranslation } from "react-i18next";
import { R, HERO_IMG, HERO_IMG_MOBILE, parseSiteText, mobileFontVar, pesoLetra } from "../lib/constants";
import { useContenido } from "../lib/contenido";

// El título va entero en el naranja de la marca. Antes era a dos tonos —"Handyman"
// naranja, el resto blanco— pero el cliente lo quiso todo del mismo color, así que
// el h1 lleva el color y no hace falta partir el texto.

// El collage tiene tramos claros (paredes y puertas blancas) donde el naranja se apaga y
// "Handyman" termina leyéndose menos que el blanco que lo acompaña — al revés de lo que se
// busca. Retocar el tono no alcanzaba: el problema es el fondo, no el color.
//
// La salida no es una caja detrás del texto —eso se lee como un parche pegado encima de la
// foto— sino apoyar el degradado que ya existía. El anterior era lineal y llegaba a 0.72:
// suficiente sobre una foto normal, corto sobre este collage. Este concentra la densidad en
// el tercio inferior, donde va el texto, y se desvanece antes de llegar arriba para no
// apagar las fotos, que son el argumento de venta.
const SCRIM = "linear-gradient(to top, rgba(15,15,15,0.92) 0%, rgba(15,15,15,0.72) 28%, rgba(15,15,15,0.35) 55%, rgba(15,15,15,0.10) 80%, transparent 100%)";

// El espaciado fijo de cada línea está calibrado para su fuente de siempre (DM Sans
// apretada, Dancing Script abierta). Con una fuente elegida en el admin va el de la
// fuente: con las tres líneas en Caveat, Anibal veía las "t" distintas en cada una
// (19/10/2026). Misma idea que la cursiva de hero-brand.
const espaciado = (estilo, deSiempre) => (estilo?.fontFamily ? "normal" : deSiempre);

// El encuadre de la foto (hero_img_x/y) se edita desde el admin: Site Texts →
// Hero Section → Image Position, que tiene la misma vista previa con drag más un
// "Reset to Center". Acá el hero es sólo de lectura.
//
// Antes había además un botón "Adjust Image" flotando sobre el hero del sitio
// público cuando había un admin logueado, con su propio modo de edición. Era la
// misma función duplicada, y encima aparecía encima del sitio de cara al
// visitante. Lo sacó Anibal el 29/08/2026.
export default function Hero({ siteConfig = {} }) {
  const { t } = useTranslation();
  const tc = useContenido();
  const title = parseSiteText(siteConfig.hero_title);
  const brandSubtitle = parseSiteText(siteConfig.hero_brand_subtitle);
  const subtitle = parseSiteText(siteConfig.hero_subtitle);
  const trust = parseSiteText(siteConfig.hero_trust);

  const posX = Number(siteConfig.hero_img_x) || 50;
  const posY = Number(siteConfig.hero_img_y) || 50;

  // El collage son tres filas idénticas de 370 px sobre una imagen de 2095x1110. Con una
  // altura suelta el recorte caía en cualquier lado y se veía una fila entera más la mitad
  // de las vecinas. Fijando la proporción a 2095/370 el alto visible equivale siempre a
  // exactamente una fila, en cualquier ancho de pantalla. En mobile manda el CSS, que lo
  // pasa a pantalla completa. Los números viven en constants.js (HERO_RATIO).
  return (
    <section className="hero-section" style={{ position: "relative", overflow: "hidden" }}>
      {/* height 100% y sin parallax: el translateY pedía que la imagen sobresaliera del
          contenedor (antes 120%), y ese excedente corría el recorte lo justo para que la
          fila dejara de calzar. Con el hero convertido en una tira el desplazamiento no se
          notaba, así que se cambió el efecto por un encuadre exacto.
          La Y va por custom property para que el CSS pueda fijarla al 50% en desktop —
          centro de la fila del medio— sin pisar el reposicionado del admin en mobile. */}
      {/* En mobile va un recorte de dos filas del collage (hero-mobile.webp). Con la imagen
          entera, para que entraran dos filas el hero tenía que medir 139 px y el texto no
          dejaba ver nada de foto. Recortada, cualquier altura muestra las dos filas completas
          y sólo se recorta a los costados. En WebP pesa 64 KB contra los 260 del hero de la compu (los
          JPEG originales quedan en public/ como fuente). */}
      <picture style={{ display: "contents" }}>
        <source media="(max-width: 640px)" srcSet={HERO_IMG_MOBILE}/>
        <img className="hero-image" src={HERO_IMG} alt={t("alt.hero")} fetchpriority="high" width={1200} height={800} draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", "--hero-x": `${posX}%`, "--hero-y": `${posY}%`, objectPosition: "var(--hero-x) var(--hero-y)", pointerEvents: "none" }}/>
      </picture>
      <div className="hero-scrim" style={{ position: "absolute", inset: 0, background: SCRIM }}/>

      {/* Content overlay */}
      <div className="hero-overlay" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 20px" }}>
        <div className="heroContent" style={{ maxWidth: 940, margin: "0 auto" }}>
            <h1 style={{
              fontSize: title?.fontSize ? `${title.fontSize}px` : "clamp(24px, 4vw, 36px)",
              fontFamily: title?.fontFamily ? `'${title.fontFamily}', sans-serif` : undefined,
              ...mobileFontVar(title),
              fontWeight: pesoLetra(title, 800), color: R, lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,0.7)", marginBottom: 4, letterSpacing: espaciado(title, "-0.02em"), whiteSpace: "pre-line"
            }}>
              {title?.text || t("hero.title")}
            </h1>
            <p className="hero-brand" style={{
              fontSize: brandSubtitle?.fontSize ? `${brandSubtitle.fontSize}px` : 15,
              fontFamily: brandSubtitle?.fontFamily ? `'${brandSubtitle.fontFamily}', cursive` : "'Dancing Script', cursive",
              ...mobileFontVar(brandSubtitle),
              fontWeight: pesoLetra(brandSubtitle),
              color: "rgba(255,255,255,0.9)", marginBottom: 3, letterSpacing: espaciado(brandSubtitle, "0.02em"),
              // La cursiva forzada sólo va con la Dancing Script de siempre. Con otra
              // fuente elegida en el admin, el navegador inclinaba la letra a mano
              // (Caveat no tiene cursiva) y las "t" y las "m" no coincidían con las del
              // subtítulo de abajo, que va derecho. Anibal lo vio el 13/10/2026.
              fontStyle: brandSubtitle?.fontFamily ? "normal" : "italic", textShadow: "0 1px 6px rgba(0,0,0,0.5)"
            }}>
              {brandSubtitle?.text || "Specialist Technician At Domestic Matters"}
            </p>
            <p className="hero-subtitle" style={{
              fontSize: subtitle?.fontSize ? `${subtitle.fontSize}px` : 14,
              fontFamily: subtitle?.fontFamily ? `'${subtitle.fontFamily}', sans-serif` : undefined,
              ...mobileFontVar(subtitle),
              fontWeight: pesoLetra(subtitle),
              color: "rgba(255,255,255,0.9)", marginBottom: 3
            }}>
              {tc(subtitle?.text) || t("hero.subtitle")}
            </p>
            {/* Línea de confianza. El texto sale del admin o de la traducción; el ✓
                lo pone el componente para que no haya que escribirlo a mano en cada
                idioma ni pegarlo dentro del campo. */}
            <div className="hero-trust" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{
                color: R,
                fontSize: trust?.fontSize ? `${trust.fontSize}px` : 13,
                fontFamily: trust?.fontFamily ? `'${trust.fontFamily}', sans-serif` : undefined,
                ...mobileFontVar(trust),
                fontWeight: pesoLetra(trust, 700),
              }}>✓ {tc(trust?.text) || t("hero.trust")}</span>
            </div>
        </div>
      </div>
    </section>
  );
}
