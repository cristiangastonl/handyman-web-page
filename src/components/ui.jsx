import { useTranslation } from "react-i18next";
import { R, svgP, getSocialUrls, socialColors, LANGS } from "../lib/constants";

export const Stars = ({ n, sz = 12 }) => {
  const { t } = useTranslation();
  return (
  <span role="img" aria-label={t("a11y.stars", { n })} style={{ fontSize: sz, letterSpacing: 1 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? "#F59E0B" : "#ddd" }}>★</span>)}
  </span>
  );
};

export const REDES = { fb: "Facebook", yt: "YouTube", wa: "WhatsApp" };
const socialLabels = REDES;

export const SocialIcon = ({ type, size = 28 }) => {
  const c = socialColors[type];
  if (type === "fb") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c}><path d={svgP.fb}/></svg>
  );
  if (type === "yt") return (
    <svg width={size} height={size} viewBox="0 0 24 24"><path d={svgP.yt} fill={c}/></svg>
  );
  if (type === "wa") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c}><path d={svgP.wa}/></svg>
  );
  return null;
};

export const Socials = ({ sz = 14, siteConfig = {} }) => {
  const redes = getSocialUrls(siteConfig);
  return (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    {Object.keys(redes).map(k => (
      <a key={k} href={redes[k]} target="_blank" rel="noopener noreferrer"
        aria-label={socialLabels[k] || k}
        style={{ opacity: 0.8, transition: "opacity .2s, transform .2s", display: "flex" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = "scale(1.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0.8; e.currentTarget.style.transform = "scale(1)"; }}>
        <SocialIcon type={k} size={sz * 2}/>
      </a>
    ))}
  </div>
  );
};

export const Logo = () => (
  <img className="logo-desktop" src="/anibal/logo-horizontal.webp" alt="Handyman Services in Zurich"
    style={{ height: 30, width: "auto", objectFit: "contain", display: "block" }}/>
);

export const GoogleG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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

// La pastilla naranja de las categorías de "Meet your handyman" (About.jsx), hecha
// botón para todo el sitio: Anibal pidió que "See all reviews", "View all FAQs" y
// los "Leave a review" de /reviews sean "como el de categorías" (26/10/2026).
// El borde naranja oscuro es el "delineado naranja a todas las pastillas".
export const NARANJA_OSCURO = "#B5621A";
export const PASTILLA = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
  cursor: "pointer", textDecoration: "none", color: "#fff",
  background: `linear-gradient(180deg, ${R} 0%, ${NARANJA_OSCURO} 100%)`,
  border: `1px solid ${NARANJA_OSCURO}`,
  transition: "transform .2s, box-shadow .2s, filter .2s",
};
const PASTILLA_SOMBRA = "0 8px 28px rgba(212,120,31,0.28)";
// Se oscurece con filter y no cambiando el fondo: CSS no interpola de un gradiente
// a un color plano y por un frame se veía el blanco de atrás.
export const pastillaHover = {
  onMouseEnter: e => { e.currentTarget.style.filter = "brightness(0.92)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = PASTILLA_SOMBRA; },
  onMouseLeave: e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; },
};

// Íconos de línea del pie (teléfono, horario, mail) y la flecha de compartir que
// mandó Anibal (26/10/2026). En currentColor, así toman el color del texto.
const Linea = ({ size, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{children}</svg>
);
export const IconoTelefono = ({ size = 14 }) => (
  <Linea size={size}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></Linea>
);
export const IconoReloj = ({ size = 14 }) => (
  <Linea size={size}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Linea>
);
export const IconoMail = ({ size = 14 }) => (
  <Linea size={size}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></Linea>
);
export const IconoCompartir = ({ size = 14 }) => (
  <Linea size={size}><path d="M14 4.5v4C7.5 8.5 3.5 12.5 3 20c2.5-4 6-5.5 11-5.5v4l7-7z"/></Linea>
);
