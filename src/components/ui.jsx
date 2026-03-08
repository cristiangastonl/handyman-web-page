import { R, svgP, socialUrls, socialIcons, LANGS } from "../lib/constants";

export const Stars = ({ n, sz = 12 }) => (
  <span role="img" aria-label={`${n} out of 5 stars`} style={{ fontSize: sz, letterSpacing: 1 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? "#F59E0B" : "#ddd" }}>★</span>)}
  </span>
);

const socialLabels = { fb: "Facebook", yt: "YouTube", wa: "WhatsApp" };

export const Socials = ({ sz = 14 }) => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    {Object.entries(socialIcons).map(([k, src]) => (
      <a key={k} href={socialUrls[k]} target="_blank" rel="noopener noreferrer"
        aria-label={socialLabels[k] || k}
        style={{ opacity: 0.8, transition: "opacity .2s, transform .2s", display: "flex" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = "scale(1.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.8; e.currentTarget.style.transform = "scale(1)"; }}>
        <img src={src} alt={socialLabels[k]} width={sz * 2} height={sz * 2} style={{ borderRadius: sz * 0.4, objectFit: "cover" }}/>
      </a>
    ))}
  </div>
);

export const Logo = () => (
  <img src="/images/logo.jpeg" alt="Handyman Services in Zurich" style={{ height: 48, width: "auto" }}/>
);

export const GoogleG = () => (
  <img src="/anibal/google_icon.jpeg" alt="Google" width="16" height="16" style={{ borderRadius: 2 }}/>
);

export const MapPin = ({ size = 18, color = "#999" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export const LangSelector = ({ currentLang, onChange }) => (
  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
    {LANGS.map(l => (
      <button key={l.code} onClick={() => onChange(l.code)}
        title={l.label}
        aria-label={l.label}
        aria-pressed={currentLang === l.code}
        style={{
          background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1,
          padding: "2px 3px", borderRadius: 4,
          opacity: currentLang === l.code ? 1 : 0.4,
          transform: currentLang === l.code ? "scale(1.15)" : "scale(1)",
          transition: "opacity .2s, transform .2s",
        }}
        onMouseEnter={e => { if (currentLang !== l.code) e.currentTarget.style.opacity = 0.7; }}
        onMouseLeave={e => { if (currentLang !== l.code) e.currentTarget.style.opacity = 0.4; }}
      >
        {l.flag}
      </button>
    ))}
  </div>
);
