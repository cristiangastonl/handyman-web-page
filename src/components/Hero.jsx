import { useTranslation } from "react-i18next";
import { R, HERO_IMG, HERO_IMG_MOBILE, parseSiteText } from "../lib/constants";

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
  const title = parseSiteText(siteConfig.hero_title);
  const brandSubtitle = parseSiteText(siteConfig.hero_brand_subtitle);
  const subtitle = parseSiteText(siteConfig.hero_subtitle);

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
      {/* En mobile va un recorte de dos filas del collage (hero-mobile.jpeg). Con la imagen
          entera, para que entraran dos filas el hero tenía que medir 139 px y el texto no
          dejaba ver nada de foto. Recortada, cualquier altura muestra las dos filas completas
          y sólo se recorta a los costados. Pesa 94 KB contra los 381 del original. */}
      <picture style={{ display: "contents" }}>
        <source media="(max-width: 640px)" srcSet={HERO_IMG_MOBILE}/>
        <img className="hero-image" src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" fetchpriority="high" width={1200} height={800} draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", "--hero-x": `${posX}%`, "--hero-y": `${posY}%`, objectPosition: "var(--hero-x) var(--hero-y)", pointerEvents: "none" }}/>
      </picture>
      <div className="hero-scrim" style={{ position: "absolute", inset: 0, background: SCRIM }}/>

      {/* Content overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 20px" }}>
        <div className="heroContent" style={{ maxWidth: 940, margin: "0 auto" }}>
            <h1 style={{
              fontSize: title?.fontSize ? `${title.fontSize}px` : "clamp(24px, 4vw, 36px)",
              fontFamily: title?.fontFamily ? `'${title.fontFamily}', sans-serif` : undefined,
              fontWeight: 800, color: R, lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,0.7)", marginBottom: 4, letterSpacing: "-0.02em", whiteSpace: "pre-line"
            }}>
              {title?.text || t("hero.title")}
            </h1>
            <p className="hero-brand" style={{
              fontSize: brandSubtitle?.fontSize ? `${brandSubtitle.fontSize}px` : 15,
              fontFamily: brandSubtitle?.fontFamily ? `'${brandSubtitle.fontFamily}', cursive` : "'Dancing Script', cursive",
              color: "rgba(255,255,255,0.9)", marginBottom: 3, fontStyle: "italic", letterSpacing: "0.02em", textShadow: "0 1px 6px rgba(0,0,0,0.5)"
            }}>
              {brandSubtitle?.text || "Specialist Technician At Domestic Matters"}
            </p>
            <p className="hero-subtitle" style={{
              fontSize: subtitle?.fontSize ? `${subtitle.fontSize}px` : 14,
              fontFamily: subtitle?.fontFamily ? `'${subtitle.fontFamily}', sans-serif` : undefined,
              color: "rgba(255,255,255,0.9)", marginBottom: 3
            }}>
              {subtitle?.text || t("hero.subtitle")}
            </p>
            {/* Trust strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: R, fontSize: 13, fontWeight: 700 }}>✓ 100% Recommended</span>
            </div>
        </div>
      </div>
    </section>
  );
}
