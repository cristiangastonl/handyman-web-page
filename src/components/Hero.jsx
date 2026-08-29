import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { R, HERO_IMG, parseSiteText } from "../lib/constants";
import { upsertSiteConfig } from "../lib/supabase";

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

export default function Hero({ siteConfig = {}, isAdmin = false, onConfigUpdate }) {
  const { t } = useTranslation();
  const title = parseSiteText(siteConfig.hero_title);
  const brandSubtitle = parseSiteText(siteConfig.hero_brand_subtitle);
  const subtitle = parseSiteText(siteConfig.hero_subtitle);

  const [editing, setEditing] = useState(false);
  const [posX, setPosX] = useState(Number(siteConfig.hero_img_x) || 50);
  const [posY, setPosY] = useState(Number(siteConfig.hero_img_y) || 50);
  const dragging = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setPosX(Number(siteConfig.hero_img_x) || 50);
    setPosY(Number(siteConfig.hero_img_y) || 50);
  }, [siteConfig.hero_img_x, siteConfig.hero_img_y]);

  const handlePointerDown = useCallback((e) => {
    if (!editing) return;
    // Don't start drag on buttons
    if (e.target.closest("button") || e.target.closest("div[data-controls]")) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [editing]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPosX(Math.round(x));
    setPosY(Math.round(y));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleSave = async () => {
    try {
      await upsertSiteConfig("hero_img_x", String(posX));
      await upsertSiteConfig("hero_img_y", String(posY));
      if (onConfigUpdate) onConfigUpdate({ ...siteConfig, hero_img_x: String(posX), hero_img_y: String(posY) });
    } catch (err) { console.warn("Save error:", err.message); }
    setEditing(false);
  };

  // El collage son tres filas idénticas de 370 px sobre una imagen de 2095x1110. Con una
  // altura suelta el recorte caía en cualquier lado y se veía una fila entera más la mitad
  // de las vecinas. Fijando la proporción a 2095/370 el alto visible equivale siempre a
  // exactamente una fila, en cualquier ancho de pantalla. En mobile manda el CSS, que lo
  // pasa a pantalla completa. Los números viven en constants.js (HERO_RATIO).
  return (
    <section ref={containerRef} className="hero-section" style={{ position: "relative", overflow: "hidden", cursor: editing ? "crosshair" : undefined }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}>
      {/* height 100% y sin parallax: el translateY pedía que la imagen sobresaliera del
          contenedor (antes 120%), y ese excedente corría el recorte lo justo para que la
          fila dejara de calzar. Con el hero convertido en una tira el desplazamiento no se
          notaba, así que se cambió el efecto por un encuadre exacto.
          La Y va por custom property para que el CSS pueda fijarla al 50% en desktop —
          centro de la fila del medio— sin pisar el reposicionado del admin en mobile. */}
      <img className="hero-image" src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" fetchpriority="high" width={1200} height={800} draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", "--hero-x": `${posX}%`, "--hero-y": `${posY}%`, objectPosition: editing ? `${posX}% ${posY}%` : "var(--hero-x) var(--hero-y)", pointerEvents: "none" }}/>
      {/* Sin la clase mientras se edita: el refuerzo mobile lleva !important y taparía la
          foto justo cuando hay que verla para reposicionarla. */}
      <div className={editing ? undefined : "hero-scrim"}
        style={{ position: "absolute", inset: 0, background: editing ? "rgba(0,0,0,0.3)" : SCRIM }}/>

      {/* Admin edit controls */}
      {isAdmin && !editing && (
        <button onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10, background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" }}>
          Adjust Image
        </button>
      )}
      {editing && (
        <div data-controls style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "rgba(0,0,0,0.7)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 500, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 12 }}>
            Drag to reposition ({posX}%, {posY}%)
            <button onClick={(e) => { e.stopPropagation(); handleSave(); }}
              style={{ background: "#D4781F", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Save
            </button>
            <button onClick={(e) => { e.stopPropagation(); setPosX(Number(siteConfig.hero_img_x) || 50); setPosY(Number(siteConfig.hero_img_y) || 50); setEditing(false); }}
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content overlay */}
      {!editing && (
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
      )}
    </section>
  );
}
