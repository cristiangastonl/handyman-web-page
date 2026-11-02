import { useState } from "react";
import { useTranslation } from "react-i18next";
import { R, PHONE, EMAIL, HORARIO, formatoHorario, SERVICE_AREAS, svgP, getSocialUrls, getGoogleProfileUrl, getStyleConfig, pesoLetra, espaciadoLetra, CONTENIDO_MAX } from "../lib/constants";
import { SocialIcon, GoogleG, REDES, IconoTelefono, IconoReloj, IconoMail, IconoCompartir, PASTILLA, pastillaHover } from "./ui";

export default function Footer({ nav, siteConfig = {} }) {
  // El pie va siempre en inglés, en todos los idiomas (Gastón, 21/10/2026): el
  // horario es un dato que no se traduce —si Anibal lo cambia, una traducción
  // vieja mentiría— y el resto del pie acompaña. Inglés es el idioma base del sitio.
  const { i18n } = useTranslation();
  const t = i18n.getFixedT("en");
  const [copied, setCopied] = useState(false);
  const headStyle = getStyleConfig(siteConfig, "footer_heading_style");
  const hoursStyle = getStyleConfig(siteConfig, "footer_hours_style");
  const phone = siteConfig.site_phone || PHONE;
  const redes = getSocialUrls(siteConfig);
  const hours = formatoHorario(siteConfig.site_hours || HORARIO);
  const areas = siteConfig.site_service_areas || SERVICE_AREAS.map(a => a.name).join(" · ");
  const email = siteConfig.site_email || EMAIL;
  // Los títulos en naranja (Anibal, 26/10/2026); antes, blanco al 50%.
  const heading = { fontSize: headStyle.fontSize, fontFamily: `'${headStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(headStyle, 700), marginBottom: 10, color: R, letterSpacing: espaciadoLetra(headStyle, 1) };
  const renglon = { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.65)" };

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try { await navigator.clipboard.writeText(url); } catch {
      const inp = document.createElement("input"); inp.value = url;
      document.body.appendChild(inp); inp.select(); document.execCommand("copy"); document.body.removeChild(inp);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer style={{ borderTop: "none", padding: "40px 24px 28px", background: "#3a3a3a" }}>
      <div style={{ maxWidth: CONTENIDO_MAX, margin: "0 auto" }}>

        {/* Top: Contact + Areas + Quick Links. Cada columna mide lo que su contenido y
            el sobrante se reparte entre ellas: Contact pegado al borde izquierdo de la
            línea, Quick Links terminando en el derecho. Con tres columnas iguales,
            Quick Links (cuatro palabras) dejaba ~400 px vacíos a la derecha y el pie se
            veía corrido a la izquierda (26/10/2026). En el celu van apiladas. */}
        <div className="footer-cols" style={{ display: "flex", justifyContent: "space-between", gap: 32, marginBottom: 36 }}>
          {/* Teléfono, WhatsApp, horario y mail, cada uno con su ícono y todos del
              mismo gris: el verde de WhatsApp desentonaba (Anibal, 26/10/2026). */}
          <div>
            <div style={heading}>{t("footer.contact")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
              <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ ...renglon, textDecoration: "none" }}><IconoTelefono/>{phone}</a>
              <a href={redes.wa} target="_blank" rel="noopener noreferrer" style={{ ...renglon, textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={svgP.wa}/></svg>
                WhatsApp
              </a>
              <div data-testid="footer-horario" style={{ ...renglon, fontSize: hoursStyle.fontSize, fontFamily: `'${hoursStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(hoursStyle) }}><IconoReloj/>{hours}</div>
              <a href={`mailto:${email}`} style={{ ...renglon, textDecoration: "none" }}><IconoMail/>{email}</a>
            </div>
          </div>
          <div style={{ flex: "0 1 380px" }}>
            <div style={heading}>{t("serviceAreas.title")}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
              {/* Espacio duro antes de cada "·", para que ningún renglón arranque con uno. */}
              {areas.replace(/ ·/g, " ·")}
            </div>
          </div>
          <div>
            <div style={heading}>{t("footer.quickLinks", "Quick Links")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["home", "portfolio", "reviews", "faq"].map(p => (
                <span key={p} onClick={() => nav(p)} role="link" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") nav(p); }} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>{t(`nav.${p}`)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Social links — clean icon row */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            {/* El orden de las tarjetas de redes de arriba de "Meet your handyman":
                Google, YouTube, WhatsApp, Facebook (Anibal, 02/11/2026; antes seguía
                al header). Google, que el header no tiene, va primero y lleva a la
                ficha del negocio en Maps; el resto sale de getSocialUrls, como el header. */}
            {[
              { type: "google", url: getGoogleProfileUrl(siteConfig), label: "Google Maps" },
              ...Object.entries(redes).map(([type, url]) => ({ type, url, label: REDES[type] })),
            ].map(s => (
              <a key={s.type} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "box-shadow .2s, transform .2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                {s.type === "google" ? <GoogleG size={22}/> : <SocialIcon type={s.type} size={22}/>}
              </a>
            ))}
          </div>

          {/* La pastilla naranja con letras blancas, como "See all reviews" y "View
              all FAQs" (Anibal, 02/11/2026). Al copiar sigue igual —se ponía verde y
              Gastón lo quiso con el mismo estilo— y sólo cambia la flecha por un tilde
              y el texto. Los dos textos ocupan la misma celda, así el botón no cambia
              de ancho. */}
          <button onClick={copyLink} data-testid="compartir-pagina" data-copiado={copied ? "si" : "no"}
            style={{ ...PASTILLA, fontSize: 12, fontFamily: "inherit" }}
            {...pastillaHover}>
            {copied
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
              : <IconoCompartir size={13}/>}
            <span style={{ display: "inline-grid" }}>
              <span style={{ gridArea: "1 / 1", visibility: copied ? "hidden" : "visible" }}>{t("footer.share", "Share this webpage")}</span>
              <span aria-live="polite" style={{ gridArea: "1 / 1", visibility: copied ? "visible" : "hidden" }}>{copied ? t("footer.copied") : ""}</span>
            </span>
          </button>

          {/* Copyright */}
          <div style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            {t("footer.credit")} <a href="https://weekly-code-stream.vercel.app/es" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>CGL</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
