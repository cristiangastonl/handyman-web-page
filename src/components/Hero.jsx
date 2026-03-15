import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PHONE, HERO_IMG, svgP, parseSiteText, SITE_TEXTS, getWALink } from "../lib/constants";
import { upsertSiteConfig } from "../lib/supabase";
import useScrollY from "../hooks/useScrollY";

export default function Hero({ nav, siteConfig = {}, isAdmin = false, onConfigUpdate, reviewCount = 0, reviewAvg = 0 }) {
  const scrollY = useScrollY();
  const { t, i18n } = useTranslation();
  const waLink = getWALink(i18n.language?.slice(0, 2));
  const title = parseSiteText(siteConfig.hero_title);
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
      <img src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" fetchPriority="high" width={1200} height={800} draggable={false}
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
              {title?.text || t("hero.title")}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", marginBottom: 3, fontStyle: "italic", fontFamily: "'Dancing Script', cursive", letterSpacing: "0.02em", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              {t("brand.subtitle")}
            </p>
            <p style={{
              fontSize: subtitle?.fontSize ? `${subtitle.fontSize}px` : 14,
              fontFamily: subtitle?.fontFamily ? `'${subtitle.fontFamily}', sans-serif` : undefined,
              color: "rgba(255,255,255,0.9)", marginBottom: 3
            }}>
              {subtitle?.text || t("hero.subtitle")}
            </p>
            {/* Rating badge */}
            {reviewAvg > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{reviewAvg}</span>
                <span style={{ color: "#F59E0B", fontSize: 14 }}>{"★".repeat(Math.round(reviewAvg))}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{reviewCount}+ {t("hero.reviews", "reviews")}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
                {t("hero.whatsapp")}
              </a>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.35 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.56 2.81.68A2 2 0 0122 16.92z"/></svg>
                {PHONE}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
