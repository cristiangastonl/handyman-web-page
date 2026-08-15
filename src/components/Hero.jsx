import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { R, HERO_IMG, parseSiteText } from "../lib/constants";
import { upsertSiteConfig } from "../lib/supabase";
import useScrollY from "../hooks/useScrollY";

// "Handyman" picks up the logo's orange; the rest of the title stays light, giving the
// two-tone the client asked for. Grey/black would be unreadable over the dark hero photo.
const BRAND_PHRASE = /(Handyman)/i;

function BrandTitle({ text }) {
  const parts = String(text).split(BRAND_PHRASE);
  return parts.map((part, i) =>
    BRAND_PHRASE.test(part) && i % 2 === 1
      ? <span key={i} style={{ color: R }}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

export default function Hero({ siteConfig = {}, isAdmin = false, onConfigUpdate }) {
  const scrollY = useScrollY();
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

  return (
    <section ref={containerRef} className="hero-section" style={{ position: "relative", height: "45vh", minHeight: 300, maxHeight: 450, overflow: "hidden", cursor: editing ? "crosshair" : undefined }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}>
      <img className="hero-image" src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" fetchpriority="high" width={1200} height={800} draggable={false}
        style={{ width: "100%", height: "120%", objectFit: "cover", objectPosition: `${posX}% ${posY}%`, transform: editing ? "none" : `translateY(${scrollY * -0.08}px)`, willChange: "transform", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", inset: 0, background: editing ? "rgba(0,0,0,0.3)" : "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)" }}/>

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
              fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,0.7)", marginBottom: 4, letterSpacing: "-0.02em", whiteSpace: "pre-line"
            }}>
              <BrandTitle text={title?.text || t("hero.title")}/>
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
