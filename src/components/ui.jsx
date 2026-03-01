import { R, svgP, socialUrls, LANGS } from "../lib/constants";

export const Stars = ({ n, sz = 12 }) => (
  <span style={{ fontSize: sz, letterSpacing: 1 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? "#F59E0B" : "#ddd" }}>★</span>)}
  </span>
);

export const Socials = ({ sz = 14, color = "#999" }) => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    {Object.entries(svgP).map(([k, path]) => (
      <a key={k} href={socialUrls[k]} target="_blank" rel="noopener noreferrer"
        style={{ color, opacity: 0.5, transition: "opacity .2s", display: "flex" }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor"><path d={path}/></svg>
      </a>
    ))}
  </div>
);

export const Logo = () => (
  <img src="/images/logo.jpeg" alt="Handyman Services in Zurich" style={{ height: 48, width: "auto" }}/>
);

export const GoogleG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
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
