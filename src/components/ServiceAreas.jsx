import { useTranslation } from "react-i18next";
import { R, SERVICE_AREAS } from "../lib/constants";
import { MapPin } from "./ui";
import { FadeIn } from "./FadeIn";

export default function ServiceAreas() {
  const { t } = useTranslation();
  return (
    <FadeIn>
    <section style={{ padding: "0 24px 40px", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{t("serviceAreas.title")}</h2>
      <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>{t("serviceAreas.subtitle")}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {SERVICE_AREAS.map(area => (
          <div key={area.name} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 10,
            background: area.primary ? R : "#f5f5f5",
            color: area.primary ? "#fff" : "#555",
            fontWeight: area.primary ? 700 : 500,
            fontSize: 13,
            border: area.primary ? "none" : "1px solid #eee",
          }}>
            <MapPin size={15} color={area.primary ? "#fff" : "#bbb"}/>
            {area.name}
          </div>
        ))}
      </div>
    </section>
    </FadeIn>
  );
}
