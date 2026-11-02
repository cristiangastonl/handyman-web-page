import { useTranslation } from "react-i18next";
import { R, G, getSocialUrls, getYtPlaylistsUrl, getGoogleProfileUrl, getHighlightField, parseSiteText, mobileFontVar, getStyleConfig, pesoLetra, espaciadoLetra, STATS, getStatValue, getStatUnit, formatStatSuffix, ABOUT_TOP, BORDE_PASTILLA } from "../lib/constants";
import { SocialIcon, GoogleG } from "./ui";
import { FadeIn, AnimatedCounter } from "./FadeIn";
import { useContenido } from "../lib/contenido";

export default function StatsBar({ siteConfig = {} }) {
  const { t } = useTranslation();
  const tc = useContenido();
  const numStyle = getStyleConfig(siteConfig, "stats_number_style");
  const lblStyle = getStyleConfig(siteConfig, "stats_label_style");
  const redes = getSocialUrls(siteConfig);
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>

      {/* Stats counters */}
      <FadeIn>
      {/* El mismo aire arriba y abajo, medido a la tinta. Se probó compensarlo a ojo
          (subir el bloque porque las etiquetas blancas pesan más que el número) y
          Gastón eligió quedarse con el centrado exacto (19/10/2026). */}
      <section className="stats-section banda-centrada" style={{ padding: "33px 24px", background: G }}>
        <div className="stats-grid" style={{ maxWidth: 940, margin: "0 auto", display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.key} style={{ textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: numStyle.fontSize, fontFamily: `'${numStyle.fontFamily}', sans-serif`, fontWeight: pesoLetra(numStyle, 800), color: R }}>
                <AnimatedCounter target={getStatValue(siteConfig, s)} decimals={s.decimals}/>
                {formatStatSuffix(getStatUnit(siteConfig, s.key, s.defaultUnit))}
              </div>
              <div style={{ ...mobileFontVar(lblStyle), fontSize: lblStyle.fontSize, fontFamily: `'${lblStyle.fontFamily}', sans-serif`, color: "rgba(255,255,255,0.7)", fontWeight: pesoLetra(lblStyle, 600), letterSpacing: espaciadoLetra(lblStyle, "0.05em"), marginTop: 7 }}>{t(s.i18nKey)}</div>
            </div>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* Social proof cards */}
      <FadeIn>
      {/* Sin aire abajo: el que separa las tarjetas de "Meet your handyman" lo pone
          About arriba (ABOUT_TOP), igual al de acá arriba. Antes eran 20 arriba contra
          68 abajo y Anibal lo vio "muy ancho" (13/10/2026). */}
      <section className="social-cards" style={{ padding: `${ABOUT_TOP}px 24px 0`, maxWidth: 940, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {/* Orden pedido por Anibal el 10/10/2026: Google, YouTube, WhatsApp,
              Facebook. Base 0 y no 200: con 200, entre 641 y ~880 px se partían 3 + 1
              y Facebook quedaba sola abajo (02/11/2026). La de Google es nueva ("como la de Facebook") y lleva a la
              ficha del negocio. Los textos se editan desde el admin (social_card_*);
              sin editar, cada idioma muestra su traducción. */}
          {[
            { type: "google", url: getGoogleProfileUrl(siteConfig), i18n: "social.google", label: "Google" },
            { type: "yt", url: getYtPlaylistsUrl(siteConfig), i18n: "social.yt", label: "YouTube" },
            { type: "wa", url: redes.wa, i18n: "social.wa", label: "WhatsApp" },
            { type: "fb", url: redes.fb, i18n: "social.fb", label: "Facebook" },
          ].map(s => ({ ...s,
            text: (h => ({ ...h, text: tc(h.text) }))(getHighlightField(siteConfig, `social_card_${s.type}`, t(s.i18n))),
            celu: mobileFontVar(parseSiteText(siteConfig[`social_card_${s.type}`])),
          })).map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="social-card"
              style={{ flex: "1 1 0", minWidth: 0, maxWidth: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 14px", borderRadius: 10, background: "#fafafa", border: BORDE_PASTILLA, textDecoration: "none", transition: "box-shadow .2s", textAlign: "center" }}
              // El borde ya es naranja siempre: el mouse encima le suma un halo.
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(212,120,31,0.22)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              {s.type === "google" ? <GoogleG size={28}/> : <SocialIcon type={s.type} size={28}/>}
              <span data-social-card={s.type} style={{ fontSize: s.text.fontSize || 11, fontFamily: s.text.fontFamily ? `'${s.text.fontFamily}', sans-serif` : undefined, fontWeight: pesoLetra(s.text), ...s.celu, color: "#555", lineHeight: 1.5 }}>{s.text.text}</span>
            </a>
          ))}
        </div>
      </section>
      </FadeIn>
    </div>
  );
}
