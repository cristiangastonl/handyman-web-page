// src/components/Admin/SiteTextsTab.jsx
// Section-based Site Texts tab -- organizes config editing by site structure.
// Extracted from AdminPanel.jsx inline config tab rendering.

import { useState, useEffect } from "react";
import { SITE_TEXTS, parseSiteText } from "../../lib/constants";
import { colors, spacing, typography, radii, A } from "../../lib/adminStyles";
import { AdminButton, AdminInput, AdminCard } from "./adminUI";

// ── Font options for text editing ──
const FONT_OPTIONS = ["DM Sans", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Playfair Display", "Dancing Script", "Georgia", "Arial", "Comic Sans MS", "Comic Neue", "Patrick Hand", "Caveat", "Indie Flower"];

// ── Stats definitions ──
const STATS = [
  { key: "stat_experience", label: "Years Experience", defaultVal: "20" },
  { key: "stat_videos", label: "Video Shows", defaultVal: "400" },
  { key: "stat_yt_views", label: "YouTube Views (in K)", defaultVal: "900" },
  { key: "stat_fb_followers", label: "Facebook Followers", defaultVal: "1400" },
];

// ── Keys that are handled by named sections (not shown in "Other Settings") ──
const KNOWN_KEYS = new Set([
  ...Object.keys(SITE_TEXTS),
  ...STATS.map(s => s.key),
  "hero_img_x",
  "hero_img_y",
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

// ── Hero image position control with sliders and live preview ──
function HeroPositionControl({ xVal, yVal, onSave, loading }) {
  const [x, setX] = useState(xVal);
  const [y, setY] = useState(yVal);
  useEffect(() => { setX(xVal); }, [xVal]);
  useEffect(() => { setY(yVal); }, [yVal]);
  const HERO_IMG = "/anibal/hero.jpeg";
  return (
    <div>
      <div style={{ position: "relative", width: "100%", paddingTop: "35%", borderRadius: radii.md, overflow: "hidden", marginBottom: spacing.md, border: `1px solid ${colors.gray200}` }}>
        <img src={HERO_IMG} alt="Hero preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% ${y}%` }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" }}/>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 10, height: 10, borderRadius: "50%", border: "2px solid #fff", background: "rgba(212,120,31,0.8)" }}/>
      </div>
      <div style={{ display: "flex", gap: spacing.lg, alignItems: "center", marginBottom: spacing.sm }}>
        <label style={{ ...typography.body, fontWeight: 600, minWidth: 80 }}>Horizontal ({x}%)</label>
        <input type="range" min="0" max="100" value={x} onChange={e => setX(e.target.value)} style={{ flex: 1 }}/>
      </div>
      <div style={{ display: "flex", gap: spacing.lg, alignItems: "center", marginBottom: spacing.md }}>
        <label style={{ ...typography.body, fontWeight: 600, minWidth: 80 }}>Vertical ({y}%)</label>
        <input type="range" min="0" max="100" value={y} onChange={e => setY(e.target.value)} style={{ flex: 1 }}/>
      </div>
      <div style={{ display: "flex", gap: spacing.sm }}>
        <AdminButton size="small" loading={loading} onClick={() => { onSave("hero_img_x", x); onSave("hero_img_y", y); }}>
          Save Position
        </AdminButton>
        <AdminButton variant="secondary" size="small" onClick={() => { setX("50"); setY("50"); }}>
          Reset
        </AdminButton>
      </div>
    </div>
  );
}

// ── Stat row for stats bar editing ──
function StatRow({ statKey, label, defaultVal, currentValue, onSave, loading }) {
  const [value, setValue] = useState(currentValue || defaultVal);
  useEffect(() => { setValue(currentValue || defaultVal); }, [currentValue, defaultVal]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
      <label style={{ ...typography.body, fontWeight: 600, minWidth: 160 }}>{label}</label>
      <input type="number" value={value} onChange={e => setValue(e.target.value)}
        className="admin-input" style={{ ...A.input, flex: 1, margin: 0, maxWidth: 120 }}/>
      <AdminButton size="small" loading={loading} onClick={() => onSave(statKey, value)}>
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

// ── Site text row with text + fontSize + fontFamily ──
function SiteTextRow({ configKey, def, currentValue, onSave, loading }) {
  const parsed = parseSiteText(currentValue) || {};
  const [text, setText] = useState(parsed.text || "");
  const [fontSize, setFontSize] = useState(parsed.fontSize || "");
  const [fontFamily, setFontFamily] = useState(parsed.fontFamily || "");

  useEffect(() => {
    const p = parseSiteText(currentValue) || {};
    setText(p.text || "");
    setFontSize(p.fontSize || "");
    setFontFamily(p.fontFamily || "");
  }, [currentValue]);

  const handleSave = () => {
    const val = { text: text || "", fontSize: fontSize ? Number(fontSize) : undefined, fontFamily: fontFamily || undefined };
    Object.keys(val).forEach(k => val[k] === undefined && delete val[k]);
    onSave(configKey, JSON.stringify(val));
  };

  return (
    <div style={{ ...A.card, marginBottom: spacing.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
        <p style={{ ...typography.body, fontWeight: 600 }}>{def.label}</p>
        <span style={{ fontSize: 9, color: colors.gray400, fontFamily: "monospace" }}>{configKey}</span>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder={def.defaultText || "(uses translation default)"}
        rows={configKey === "bio_text" ? 4 : 2}
        className="admin-input" style={{ ...A.textarea, marginBottom: spacing.sm }}/>
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
      {text && (
        <div style={{ marginTop: spacing.sm, padding: `${spacing.sm}px ${spacing.md}px`, background: colors.gray50, borderRadius: radii.md, border: `1px dashed ${colors.gray200}` }}>
          <span style={{ fontSize: 9, color: colors.gray400, display: "block", marginBottom: spacing.xs }}>Preview:</span>
          <span style={{
            fontSize: fontSize ? `${fontSize}px` : `${def.defaultFontSize}px`,
            fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : `'${def.defaultFontFamily}', sans-serif`,
          }}>{text}</span>
        </div>
      )}
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

// ── Info box for placeholder sections ──
function PlaceholderInfo({ text }) {
  return (
    <div style={{ ...A.infoBox, fontSize: 12 }}>
      {text}
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

      {/* ── 1. Hero Section ── */}
      <AdminCard title="Hero Section" style={{ marginBottom: spacing.xl }}>
        {/* Hero visual preview */}
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

        {/* Hero image position */}
        <p style={{ ...typography.label, marginBottom: spacing.sm }}>Image Position</p>
        <HeroPositionControl
          xVal={siteConfig.hero_img_x || "50"}
          yVal={siteConfig.hero_img_y || "50"}
          onSave={onSave}
          loading={loading}
        />

        {/* Hero text fields */}
        <p style={{ ...typography.label, marginTop: spacing.xl, marginBottom: spacing.sm }}>Text Fields</p>
        {["hero_title", "hero_subtitle", "hero_brand_subtitle"].map(key => (
          <SiteTextRow key={key} configKey={key} def={SITE_TEXTS[key]} currentValue={siteConfig[key]} onSave={onSave} loading={loading} />
        ))}
      </AdminCard>

      {/* ── 2. About Section ── */}
      <AdminCard title="About Section" style={{ marginBottom: spacing.xl }}>
        {/* About visual preview */}
        <PreviewBox>
          <div style={{
            ...getTextStyle(siteConfig, "bio_text"),
            color: colors.gray700,
            whiteSpace: "pre-line",
          }}>
            {getTextValue(siteConfig, "bio_text") || "(No bio text set -- uses translation default)"}
          </div>
        </PreviewBox>

        <SiteTextRow configKey="bio_text" def={SITE_TEXTS.bio_text} currentValue={siteConfig.bio_text} onSave={onSave} loading={loading} />
      </AdminCard>

      {/* ── 3. Stats Bar ── */}
      <AdminCard title="Stats Bar" style={{ marginBottom: spacing.xl }}>
        {/* Stats visual preview */}
        <PreviewBox dark>
          <div style={{ display: "flex", justifyContent: "space-around", padding: `${spacing.sm}px 0` }}>
            {STATS.map(stat => {
              const val = siteConfig[stat.key] || stat.defaultVal;
              return (
                <div key={stat.key} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: colors.brand }}>{val}{stat.key === "stat_yt_views" ? "K+" : "+"}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </PreviewBox>

        {STATS.map(stat => (
          <StatRow key={stat.key} statKey={stat.key} label={stat.label} defaultVal={stat.defaultVal} currentValue={siteConfig[stat.key]} onSave={onSave} loading={loading} />
        ))}
      </AdminCard>

      {/* ── 4. Carousels ── */}
      <AdminCard title="Carousels" style={{ marginBottom: spacing.xl }}>
        <SiteTextRow configKey="highlights_section_title" def={SITE_TEXTS.highlights_section_title} currentValue={siteConfig.highlights_section_title} onSave={onSave} loading={loading} />
        <p style={{ ...typography.caption, marginTop: spacing.sm }}>
          Carousel content is managed in the Carousels tab. Typography controls coming in Phase 7.
        </p>
      </AdminCard>

      {/* ── 5. CTAs ── */}
      <AdminCard title="Call to Action Sections" style={{ marginBottom: spacing.xl }}>
        <PlaceholderInfo text="CTA text styling controls coming in Phase 7." />
      </AdminCard>

      {/* ── 6. Reviews ── */}
      <AdminCard title="Reviews Section" style={{ marginBottom: spacing.xl }}>
        <PlaceholderInfo text="Reviews section styling controls coming in Phase 7." />
      </AdminCard>

      {/* ── 7. Footer ── */}
      <AdminCard title="Footer" style={{ marginBottom: spacing.xl }}>
        <PlaceholderInfo text="Footer text styling controls coming in Phase 7." />
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
