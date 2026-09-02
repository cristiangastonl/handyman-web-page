// src/components/Admin/SiteTextsTab.jsx
// Section-based Site Texts tab -- organizes config editing by site structure.
// Extracted from AdminPanel.jsx inline config tab rendering.

import { useState, useEffect, useRef, useCallback } from "react";
import { SITE_TEXTS, parseSiteText, STYLE_KEYS, getStyleConfig, PHONE, SERVICE_AREAS,
  STATS, STAT_UNITS, statUnitKey, getStatValue, getStatUnit, formatStatSuffix } from "../../lib/constants";
import { textoVigente, payloadSiteText } from "../../lib/siteText";
import { colors, spacing, typography, radii, A } from "../../lib/adminStyles";
import { AdminButton, AdminInput, AdminCard } from "./adminUI";

// ── Font options for text editing ──
const FONT_OPTIONS = ["DM Sans", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Playfair Display", "Dancing Script", "Georgia", "Arial", "Comic Sans MS", "Comic Neue", "Patrick Hand", "Caveat", "Indie Flower"];

// ── Keys that are handled by named sections (not shown in "Other Settings") ──
const KNOWN_KEYS = new Set([
  ...Object.keys(SITE_TEXTS),
  ...Object.keys(STYLE_KEYS),
  ...STATS.map(s => s.key),
  ...STATS.map(s => statUnitKey(s.key)),
  "hero_img_x",
  "hero_img_y",
  "site_phone",
  "site_hours",
  "site_service_areas",
  // Legacy keys already in site_config (managed elsewhere or via Contact & Business Info)
  "phone",
  "whatsapp_url",
  "facebook_url",
  "youtube_url",
  "brand_subtitle",
  "storage_limit_gb",
]);

// ── Preview wrapper ──
function PreviewBox({ dark, children }) {
  return (
    <div style={{
      background: dark ? "#1a1a1a" : colors.gray50,
      border: `1px dashed ${colors.gray200}`,
      borderRadius: radii.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    }}>
      <span style={{ fontSize: 9, color: dark ? "rgba(255,255,255,0.4)" : colors.gray400, display: "block", marginBottom: spacing.xs }}>Preview</span>
      {children}
    </div>
  );
}

// ── Hero image position control with drag & drop ──
function HeroPositionControl({ xVal, yVal, onSave, loading }) {
  const [x, setX] = useState(Number(xVal));
  const [y, setY] = useState(Number(yVal));
  const containerRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => { setX(Number(xVal)); }, [xVal]);
  useEffect(() => { setY(Number(yVal)); }, [yVal]);

  const updateFromEvent = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newX = Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    const newY = Math.round(Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)));
    setX(newX);
    setY(newY);
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    updateFromEvent(e);
  }, [updateFromEvent]);

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) { e.preventDefault(); updateFromEvent(e); } };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromEvent]);

  const HERO_IMG = "/anibal/hero.jpeg";
  return (
    <div>
      <div
        ref={containerRef}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        style={{
          position: "relative", width: "100%", paddingTop: "35%", borderRadius: radii.md,
          overflow: "hidden", marginBottom: spacing.sm, border: `1px solid ${colors.gray200}`,
          cursor: "crosshair", userSelect: "none",
        }}
      >
        <img src={HERO_IMG} alt="Hero preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% ${y}%` }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" }}/>
        {/* Crosshair indicator */}
        <div style={{
          position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)",
          width: 20, height: 20, borderRadius: "50%",
          border: "2px solid #fff", background: "rgba(212,120,31,0.7)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)",
          pointerEvents: "none",
        }}/>
        {/* Position label */}
        <div style={{
          position: "absolute", bottom: 6, right: 8,
          background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, fontWeight: 600,
          padding: "2px 6px", borderRadius: radii.sm,
        }}>
          {x}%, {y}%
        </div>
      </div>
      <p style={{ ...typography.caption, marginBottom: spacing.md }}>Click or drag on the image to set the focal point.</p>
      <div style={{ display: "flex", gap: spacing.sm }}>
        <AdminButton size="small" loading={loading} onClick={() => { onSave("hero_img_x", String(x)); onSave("hero_img_y", String(y)); }}>
          Save Position
        </AdminButton>
        <AdminButton variant="secondary" size="small" onClick={() => { setX(50); setY(50); }}>
          Reset to Center
        </AdminButton>
      </div>
    </div>
  );
}

// ── Stat row for stats bar editing ──
function StatRow({ statKey, label, defaultVal, decimals, currentValue, currentUnit, onSave, loading }) {
  const [value, setValue] = useState(currentValue || defaultVal);
  const [unit, setUnit] = useState(currentUnit);
  useEffect(() => { setValue(currentValue || defaultVal); }, [currentValue, defaultVal]);
  useEffect(() => { setUnit(currentUnit); }, [currentUnit]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm, flexWrap: "wrap" }}>
      <label style={{ ...typography.body, fontWeight: 600, minWidth: 160 }}>{label}</label>
      <input type="number" step={decimals > 0 ? "0.1" : "1"} value={value} onChange={e => setValue(e.target.value)}
        className="admin-input" style={{ ...A.input, flex: 1, margin: 0, maxWidth: 120 }}/>
      <select value={unit} onChange={e => setUnit(e.target.value)} title="Magnitude"
        className="admin-input" style={{ ...A.input, margin: 0, width: 70 }}>
        {STAT_UNITS.map(u => <option key={u} value={u}>{u === "" ? "\u2013" : u}</option>)}
      </select>
      <span style={{ ...typography.caption, minWidth: 70, color: colors.gray500 }}>
        shows {value || defaultVal}{formatStatSuffix(unit)}
      </span>
      <AdminButton size="small" loading={loading}
        onClick={() => { onSave(statKey, value); onSave(statUnitKey(statKey), unit); }}>
        Save
      </AdminButton>
    </div>
  );
}

// ── Controlled config row component for extra settings ──
function ConfigRow({ configKey, initialValue, onSave, loading }) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  return (
    <div style={A.listItem}>
      <label style={{ ...typography.body, fontWeight: 600, minWidth: 120 }}>{configKey}</label>
      <input value={value} onChange={e => setValue(e.target.value)} className="admin-input" style={{ ...A.input, flex: 1, margin: 0 }}/>
      <AdminButton size="small" loading={loading} onClick={() => onSave(configKey, value)}>
        Save
      </AdminButton>
    </div>
  );
}

// ── Style-only control for i18n texts (no text editing -- only fontSize + fontFamily) ──
function StyleControl({ configKey, label, hint, siteConfig, onSave, loading }) {
  const defaults = STYLE_KEYS[configKey] || { fontSize: 14, fontFamily: "DM Sans" };
  const current = getStyleConfig(siteConfig, configKey);
  const [fontSize, setFontSize] = useState(current.fontSize);
  const [fontFamily, setFontFamily] = useState(current.fontFamily);

  useEffect(() => {
    const c = getStyleConfig(siteConfig, configKey);
    setFontSize(c.fontSize);
    setFontFamily(c.fontFamily);
  }, [siteConfig[configKey]]);

  const handleSave = () => {
    onSave(configKey, JSON.stringify({ fontSize: Number(fontSize), fontFamily }));
  };

  return (
    <div style={{ marginBottom: spacing.lg, padding: `${spacing.md}px`, background: colors.gray50, borderRadius: radii.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
        <label style={{ ...typography.caption, fontWeight: 600 }}>{label}</label>
      </div>
      {hint && (
        <div style={{
          fontSize: Number(fontSize) > 18 ? 14 : Number(fontSize) || defaults.fontSize,
          fontFamily: `'${fontFamily || defaults.fontFamily}', sans-serif`,
          color: colors.gray600,
          marginBottom: spacing.sm,
          lineHeight: 1.4,
          padding: `${spacing.xs}px 0`,
          borderBottom: `1px dashed ${colors.gray200}`,
          paddingBottom: spacing.sm,
        }}>
          "{hint}"
        </div>
      )}
      <div style={{ display: "flex", gap: spacing.sm, alignItems: "flex-end" }}>
        <div style={{ width: 80 }}>
          <label style={typography.caption}>Size (px)</label>
          <input type="number" value={fontSize} onChange={e => setFontSize(e.target.value)}
            placeholder={`${defaults.fontSize}`}
            className="admin-input" style={{ ...A.input, marginTop: 2, height: 32, fontSize: 12 }}/>
        </div>
        <div style={{ flex: 1 }}>
          <label style={typography.caption}>Font</label>
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
            className="admin-input" style={{ ...A.input, marginTop: 2, height: 32, fontSize: 12 }}>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <AdminButton size="small" loading={loading} onClick={handleSave}>Save</AdminButton>
      </div>
    </div>
  );
}

// ── Site text row with text + fontSize + fontFamily ──
/**
 * Una fila de texto editable del sitio.
 *
 * El campo arranca con el texto que hoy se ve en la página, no vacío. Antes el
 * texto actual iba de `placeholder`: se leía igual pero no se podía tocar, sólo
 * reemplazar entero escribiendo de cero. Anibal lo reportó como "este no me deja
 * editarlo" (02/09) mandando una captura del campo con el texto adentro — porque
 * eso es exactamente lo que parece.
 *
 * La contracara de precargarlo es que guardar cualquier otra cosa —el tamaño de
 * letra, por ejemplo— dejaría el texto en inglés grabado en site_config, y lo
 * guardado le gana a la traducción: los otros 4 idiomas perderían la suya. Por
 * eso, si el texto quedó idéntico al default, no se manda: se guarda sólo lo que
 * él efectivamente cambió y la traducción sigue viva.
 */
function SiteTextRow({ configKey, def, currentValue, onSave, loading }) {
  const parsed = parseSiteText(currentValue) || {};
  const [text, setText] = useState(() => textoVigente(currentValue, def));
  const [fontSize, setFontSize] = useState(parsed.fontSize || "");
  const [fontFamily, setFontFamily] = useState(parsed.fontFamily || "");

  useEffect(() => {
    const p = parseSiteText(currentValue) || {};
    setText(textoVigente(currentValue, def));
    setFontSize(p.fontSize || "");
    setFontFamily(p.fontFamily || "");
  }, [currentValue]);

  const sinTocar = !payloadSiteText({ text }, def).text;

  const handleSave = () =>
    onSave(configKey, JSON.stringify(payloadSiteText({ text, fontSize, fontFamily }, def)));

  return (
    <div style={{ ...A.card, marginBottom: spacing.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
        <p style={{ ...typography.body, fontWeight: 600 }}>{def.label}</p>
        <span style={{ fontSize: 9, color: colors.gray400, fontFamily: "monospace" }}>{configKey}</span>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder={def.defaultText || "(uses translation default)"}
        rows={configKey === "bio_text" ? 4 : 2}
        className="admin-input" style={{ ...A.textarea, marginBottom: spacing.xs }}/>
      <p style={{ ...typography.caption, color: colors.gray400, marginBottom: spacing.sm }}>
        {sinTocar
          ? "Sin cambios: cada idioma sigue mostrando su propia traducción."
          : "Editado: este texto se va a ver igual en los 5 idiomas."}
      </p>
      <div style={{ display: "flex", gap: spacing.sm }}>
        <div style={{ flex: 1 }}>
          <label style={typography.caption}>Font size (px)</label>
          <input type="number" value={fontSize} onChange={e => setFontSize(e.target.value)}
            placeholder={`${def.defaultFontSize}`}
            className="admin-input" style={{ ...A.input, marginTop: 2 }}/>
        </div>
        <div style={{ flex: 2 }}>
          <label style={typography.caption}>Font family</label>
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
            className="admin-input" style={{ ...A.input, marginTop: 2, color: fontFamily ? colors.gray900 : colors.gray400 }}>
            <option value="">Default ({def.defaultFontFamily})</option>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <AdminButton loading={loading} onClick={handleSave}
        style={{ marginTop: spacing.sm }}>
        Save
      </AdminButton>
    </div>
  );
}

// ── Helper: get text value for preview ──
function getTextValue(siteConfig, key) {
  const parsed = parseSiteText(siteConfig[key]);
  if (parsed && parsed.text) return parsed.text;
  return SITE_TEXTS[key] ? SITE_TEXTS[key].defaultText : "";
}

function getTextStyle(siteConfig, key) {
  const parsed = parseSiteText(siteConfig[key]) || {};
  const def = SITE_TEXTS[key] || {};
  return {
    fontSize: parsed.fontSize ? `${parsed.fontSize}px` : `${def.defaultFontSize || 14}px`,
    fontFamily: parsed.fontFamily ? `'${parsed.fontFamily}', sans-serif` : `'${def.defaultFontFamily || "DM Sans"}', sans-serif`,
  };
}

// ── Simple text field for footer content (phone, hours, areas) ──
function FooterField({ label, configKey, defaultValue, siteConfig, onSave, loading, hint }) {
  const [value, setValue] = useState(siteConfig[configKey] || defaultValue);
  useEffect(() => { setValue(siteConfig[configKey] || defaultValue); }, [siteConfig[configKey], defaultValue]);
  return (
    <div style={{ display: "flex", gap: spacing.sm, alignItems: "flex-end", marginBottom: spacing.md }}>
      <div style={{ flex: 1 }}>
        <label style={{ ...typography.caption, fontWeight: 600 }}>{label}</label>
        {hint && <span style={{ ...typography.caption, color: colors.gray400, marginLeft: spacing.sm }}>{hint}</span>}
        <input value={value} onChange={e => setValue(e.target.value)}
          placeholder={defaultValue}
          className="admin-input" style={{ ...A.input, marginTop: 2 }}/>
      </div>
      <AdminButton size="small" loading={loading} onClick={() => onSave(configKey, value)}>Save</AdminButton>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════

export default function SiteTextsTab({ siteConfig, onSave, loading, cfgKey, setCfgKey, cfgVal, setCfgVal }) {
  const prevent = (fn) => (e) => { e.preventDefault(); fn(); };

  return (
    <div>
      {/* Info box */}
      <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
        <strong>How it works:</strong> Each section below matches a part of the live site. Edit texts, adjust font sizes, and preview changes in real time.
      </div>

      {/* ── 0. Contact & Business Info (used across the site) ── */}
      <AdminCard title="Contact & Business Info" style={{ marginBottom: spacing.xl }}>
        <p style={{ ...typography.caption, marginBottom: spacing.lg, color: colors.gray500 }}>These values are used across the entire site — footer, CTAs, service areas, social links.</p>
        <FooterField label="Phone Number" configKey="site_phone" defaultValue={siteConfig.phone || PHONE} siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <FooterField label="WhatsApp URL" configKey="whatsapp_url" defaultValue={siteConfig.whatsapp_url || ""} siteConfig={siteConfig} onSave={onSave} loading={loading} hint="Full wa.me link" />
        <FooterField label="Facebook URL" configKey="facebook_url" defaultValue={siteConfig.facebook_url || ""} siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <FooterField label="YouTube URL" configKey="youtube_url" defaultValue={siteConfig.youtube_url || ""} siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <FooterField label="Brand Subtitle" configKey="brand_subtitle" defaultValue={siteConfig.brand_subtitle || "Specialist Technician At Domestic Matters"} siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <FooterField label="Business Hours" configKey="site_hours" defaultValue="Mon–Sat · 8:00–19:00" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <FooterField label="Service Areas" configKey="site_service_areas" defaultValue={SERVICE_AREAS.map(a => a.name).join(" · ")} siteConfig={siteConfig} onSave={onSave} loading={loading} hint="Separate with · (middle dot)" />
        <FooterField label="Storage Limit (GB)" configKey="storage_limit_gb" defaultValue={siteConfig.storage_limit_gb || "10"} siteConfig={siteConfig} onSave={onSave} loading={loading} hint="Max GB for this project (shown in header bar)" />
      </AdminCard>

      {/* ── 1. Hero Section ── */}
      <AdminCard title="Hero Section" style={{ marginBottom: spacing.xl }}>
        {/* Hero image position — drag to reposition */}
        <p style={{ ...typography.label, marginBottom: spacing.sm }}>Image Position</p>
        <HeroPositionControl
          xVal={siteConfig.hero_img_x || "50"}
          yVal={siteConfig.hero_img_y || "50"}
          onSave={onSave}
          loading={loading}
        />

        {/* Hero text preview + controls together */}
        <p style={{ ...typography.label, marginTop: spacing.xl, marginBottom: spacing.sm }}>Hero Texts</p>
        <PreviewBox dark>
          <div style={{ textAlign: "center", padding: `${spacing.lg}px 0` }}>
            <div style={{
              ...getTextStyle(siteConfig, "hero_title"),
              color: "#fff",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: spacing.sm,
              whiteSpace: "pre-line",
            }}>
              {getTextValue(siteConfig, "hero_title")}
            </div>
            <div style={{
              ...getTextStyle(siteConfig, "hero_brand_subtitle"),
              color: colors.brand,
              marginBottom: spacing.xs,
            }}>
              {getTextValue(siteConfig, "hero_brand_subtitle")}
            </div>
            <div style={{
              ...getTextStyle(siteConfig, "hero_subtitle"),
              color: "rgba(255,255,255,0.8)",
            }}>
              {getTextValue(siteConfig, "hero_subtitle")}
            </div>
          </div>
        </PreviewBox>
        {["hero_title", "hero_brand_subtitle", "hero_subtitle", "hero_trust"].map(key => (
          <SiteTextRow key={key} configKey={key} def={SITE_TEXTS[key]} currentValue={siteConfig[key]} onSave={onSave} loading={loading} />
        ))}
      </AdminCard>

      {/* ── 2. About Section ── */}
      <AdminCard title="About Section" style={{ marginBottom: spacing.xl }}>
        {/* Bio preview + controls */}
        <p style={{ ...typography.label, marginBottom: spacing.sm }}>Bio Text</p>
        <PreviewBox>
          <div style={{
            ...getTextStyle(siteConfig, "bio_text"),
            color: colors.gray700,
            whiteSpace: "pre-line",
          }}>
            {getTextValue(siteConfig, "bio_text") || "(No bio text set — uses translation default)"}
          </div>
        </PreviewBox>
        <SiteTextRow configKey="bio_text" def={SITE_TEXTS.bio_text} currentValue={siteConfig.bio_text} onSave={onSave} loading={loading} />

        <p style={{ ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm }}>Highlight Boxes</p>
        <p style={{ ...typography.caption, marginBottom: spacing.sm, color: colors.gray500 }}>
          The three cards under your bio. Leave a field empty to keep the built-in translated text.
          Anything you type here shows in every language.
        </p>
        <PreviewBox>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: spacing.sm }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ padding: `${spacing.md}px`, borderRadius: radii.md, background: colors.white, border: `1px solid ${colors.gray200}`, borderLeft: `3px solid ${colors.brand}` }}>
                <div style={{ ...getTextStyle(siteConfig, `about_highlight${n}_title`), fontWeight: 700, color: colors.gray900, marginBottom: 4, whiteSpace: "pre-line" }}>
                  {getTextValue(siteConfig, `about_highlight${n}_title`)}
                </div>
                <div style={{ ...getTextStyle(siteConfig, `about_highlight${n}_text`), color: colors.gray700, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                  {getTextValue(siteConfig, `about_highlight${n}_text`)}
                </div>
              </div>
            ))}
          </div>
        </PreviewBox>
        {[1, 2, 3].flatMap(n => [`about_highlight${n}_title`, `about_highlight${n}_text`]).map(key => (
          <SiteTextRow key={key} configKey={key} def={SITE_TEXTS[key]} currentValue={siteConfig[key]} onSave={onSave} loading={loading} />
        ))}
      </AdminCard>

      {/* ── 3. Stats Bar ── */}
      <AdminCard title="Stats Bar" style={{ marginBottom: spacing.xl }}>
        {/* Stats visual preview */}
        <PreviewBox dark>
          <div style={{ display: "flex", justifyContent: "space-around", padding: `${spacing.sm}px 0` }}>
            {STATS.map(stat => {
              const val = getStatValue(siteConfig, stat);
              const numStyle = getStyleConfig(siteConfig, "stats_number_style");
              const lblStyle = getStyleConfig(siteConfig, "stats_label_style");
              return (
                <div key={stat.key} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: numStyle.fontSize, fontFamily: `'${numStyle.fontFamily}', sans-serif`, fontWeight: 700, color: colors.brand }}>{val}{formatStatSuffix(getStatUnit(siteConfig, stat.key, stat.defaultUnit))}</div>
                  <div style={{ fontSize: lblStyle.fontSize > 9 ? 9 : lblStyle.fontSize, fontFamily: `'${lblStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </PreviewBox>

        {STATS.map(stat => (
          <StatRow key={stat.key} statKey={stat.key} label={stat.label} defaultVal={stat.defaultVal} decimals={stat.decimals}
            currentValue={String(getStatValue(siteConfig, stat))} currentUnit={getStatUnit(siteConfig, stat.key, stat.defaultUnit)}
            onSave={onSave} loading={loading} />
        ))}

        <p style={{ ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm }}>Typography</p>
        <StyleControl configKey="stats_number_style" label="Counter Numbers" hint="20+, 400+, 1.3M+, 1.4K+ — magnitude is set per stat above" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="stats_label_style" label="Counter Labels" hint="Years Experience, Video Shows, YouTube Views, Facebook Followers" siteConfig={siteConfig} onSave={onSave} loading={loading} />
      </AdminCard>

      {/* ── 4. Carousels ── */}
      <AdminCard title="Carousels" style={{ marginBottom: spacing.xl }}>
        <SiteTextRow configKey="highlights_section_title" def={SITE_TEXTS.highlights_section_title} currentValue={siteConfig.highlights_section_title} onSave={onSave} loading={loading} />
        <p style={{ ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm }}>Carousel Title Typography</p>
        <StyleControl configKey="carousel_recent_work_title_style" label="Recent Work — Section Title" hint="Recent work" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="carousel_highlights_title_style" label="Highlights — Section Title" hint="Highlights" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="carousel_tailor_jobs_title_style" label="Custom Projects — Section Title" hint="Custom Projects" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <p style={{ ...typography.caption, marginTop: spacing.sm }}>
          Carousel content is managed in the Carousels tab.
        </p>
      </AdminCard>

      {/* ── 5. CTAs ── */}
      <AdminCard title="Call to Action Sections" style={{ marginBottom: spacing.xl }}>
        <p style={{ ...typography.label, marginBottom: spacing.sm }}>Tailoring CTA (mid-page)</p>
        <StyleControl configKey="cta_tailoring_title_style" label="Tailoring — Title" hint="Need something specific?" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="cta_tailoring_text_style" label="Tailoring — Description" hint="I also do tailored work — from unique installations to custom projects..." siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <p style={{ ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm }}>Bottom CTA (before footer)</p>
        <StyleControl configKey="cta_bottom_title_style" label="Bottom CTA — Title" hint="Ready to get started?" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="cta_bottom_subtitle_style" label="Bottom CTA — Subtitle" hint="Reply within 24 hours · Lifetime guarantee" siteConfig={siteConfig} onSave={onSave} loading={loading} />
      </AdminCard>

      {/* ── 6. Reviews ── */}
      <AdminCard title="Reviews Section" style={{ marginBottom: spacing.xl }}>
        <StyleControl configKey="reviews_title_style" label="Reviews — Section Title" hint="Reviews" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="reviews_score_style" label="Reviews — Average Score" hint="4.8" siteConfig={siteConfig} onSave={onSave} loading={loading} />
      </AdminCard>

      {/* ── 7. Footer ── */}
      <AdminCard title="Footer" style={{ marginBottom: spacing.xl }}>
        <p style={{ ...typography.caption, marginBottom: spacing.lg, color: colors.gray500 }}>Phone, hours, and service areas are in "Contact & Business Info" above — shared across the site.</p>
        <StyleControl configKey="footer_heading_style" label="Footer — Section Headings" hint="Contact, Hours, Quick Links" siteConfig={siteConfig} onSave={onSave} loading={loading} />
        <StyleControl configKey="footer_hours_style" label="Footer — Hours Text" hint={siteConfig.site_hours || "Mon–Sat · 8:00–19:00"} siteConfig={siteConfig} onSave={onSave} loading={loading} />
      </AdminCard>

      {/* ── Other Settings ── */}
      {Object.entries(siteConfig).filter(([key]) => !KNOWN_KEYS.has(key)).length > 0 && (
        <>
          <p style={{ ...typography.label, marginTop: spacing["2xl"] }}>Other Settings</p>
          {Object.entries(siteConfig).filter(([key]) => !KNOWN_KEYS.has(key)).map(([key, value]) => (
            <ConfigRow key={key} configKey={key} initialValue={value} onSave={onSave} loading={loading} />
          ))}
        </>
      )}

      {/* ── Add Custom Setting ── */}
      <AdminCard title="Add Custom Setting" style={{ marginTop: spacing.lg }}>
        <form onSubmit={prevent(() => {
          if (!cfgKey.trim()) return;
          onSave(cfgKey.trim(), cfgVal.trim());
          setCfgKey(""); setCfgVal("");
        })}>
          <AdminInput label="Key" value={cfgKey} onChange={e => setCfgKey(e.target.value)} placeholder="Key" />
          <AdminInput label="Value" value={cfgVal} onChange={e => setCfgVal(e.target.value)} placeholder="Value" />
          <AdminButton type="submit" loading={loading}
            style={{ marginTop: spacing.md }}>
            Save
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
