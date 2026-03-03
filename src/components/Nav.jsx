import { useTranslation } from "react-i18next";
import { R, S } from "../lib/constants";
import { Socials, Logo, LangSelector } from "./ui";

export default function Nav({ page, nav, mobileMenu, setMobileMenu, changeLang }) {
  const { t, i18n } = useTranslation();
  return (
    <nav style={S.nav}>
      <div style={S.navIn}>
        <button onClick={() => nav("home")} style={{ background: "none", border: "none", cursor: "pointer" }}><Logo/></button>
        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["home","portfolio","reviews","faq"].map(p => (
            <button key={p} onClick={() => nav(p)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 12px", fontSize: 13, fontWeight: page === p ? 600 : 400, color: page === p ? R : "#777" }}>
              {t(`nav.${p}`)}
            </button>
          ))}
          <div style={{ width: 1, height: 14, background: "#e5e5e5", margin: "0 6px" }}/>
          <Socials sz={13}/>
          <div style={{ width: 1, height: 14, background: "#e5e5e5", margin: "0 6px" }}/>
          <LangSelector currentLang={i18n.language} onChange={changeLang}/>
        </div>
        {/* Mobile hamburger */}
        <button className="mobile-hamburger" onClick={() => setMobileMenu(!mobileMenu)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, fontSize: 22, lineHeight: 1, display: "none" }}
          aria-label="Toggle menu">
          {mobileMenu ? "×" : "☰"}
        </button>
      </div>
      {/* Mobile menu overlay — closes menu on tap outside */}
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          style={{ position: "fixed", inset: 0, zIndex: 98, background: "transparent" }}
        />
      )}
      {/* Mobile menu dropdown */}
      {mobileMenu && (
        <div className="mobile-menu" style={{ position: "relative", zIndex: 99, padding: "8px 24px 16px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.98)" }}>
          {["home","portfolio","reviews","faq"].map(p => (
            <button key={p} onClick={() => nav(p)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 0", fontSize: 15, fontWeight: page === p ? 600 : 400, color: page === p ? R : "#666", textAlign: "left" }}>
              {t(`nav.${p}`)}
            </button>
          ))}
          <div style={{ paddingTop: 8, display: "flex", alignItems: "center", gap: 16 }}>
            <Socials sz={16}/>
            <LangSelector currentLang={i18n.language} onChange={changeLang}/>
          </div>
        </div>
      )}
    </nav>
  );
}
