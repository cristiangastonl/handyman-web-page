import { useTranslation } from "react-i18next";
import { R, PROFILE_IMG } from "../lib/constants";
import { FadeIn } from "./FadeIn";

export default function About({ nav, siteConfig = {} }) {
  const { t } = useTranslation();
  return (
    <FadeIn>
    <section style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <img src={PROFILE_IMG} alt="Professional handyman in Zurich - specialist for home repairs" style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{t("about.title")}</h2>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 6 }}>
            {siteConfig.bio_text || t("about.bio")}
          </p>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5, marginBottom: 12, fontStyle: "italic" }}>
            {t("about.expatNote")}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["electricity","plumbing","assembly","fixings","gardening","wallMounting"].map(s => (
              <button key={s} onClick={() => nav("portfolio")}
                style={{ padding: "5px 12px", borderRadius: 16, border: "1px solid #eee", fontSize: 12, color: "#777", fontWeight: 500, background: "none", cursor: "pointer", transition: "border-color .2s, color .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.color = R; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.color = "#777"; }}>
                {t(`about.skills.${s}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Highlight cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 28 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ padding: "16px 18px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 4 }}>{t(`about.highlight${n}.title`)}</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.55 }}>{t(`about.highlight${n}.text`)}</div>
          </div>
        ))}
      </div>
    </section>
    </FadeIn>
  );
}
