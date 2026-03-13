import { useTranslation } from "react-i18next";
import { R, SERVICE_AREAS } from "../lib/constants";
import { MapPin } from "./ui";
import { FadeIn } from "./FadeIn";

export default function ServiceAreas() {
  const { t } = useTranslation();
  return (
    <FadeIn>
    <section style={{ padding: "40px 24px", maxWidth: 940, margin: "0 auto" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>{t("serviceAreas.title")}</h2>
      <p style={{ fontSize: 12, color: "#666", marginBottom: 16, textAlign: "center" }}>{t("serviceAreas.subtitle")}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {SERVICE_AREAS.map(area => (
          <div key={area.name} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 10,
            background: R,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            border: "none",
          }}>
            <MapPin size={15} color="#fff"/>
            {area.name}
          </div>
        ))}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 18px", borderRadius: 10,
          background: R,
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          border: "none",
          fontStyle: "italic",
        }}>
          … {t("serviceAreas.surroundingCanton")}
        </div>
      </div>
    </section>
    </FadeIn>
  );
}
