import { useTranslation } from "react-i18next";
import { Socials } from "./ui";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ borderTop: "1px solid #f0f0f0", padding: "28px 24px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 16, color: "#ccc", marginBottom: 10 }}>{t("footer.follow")}</div>
        <div style={{ display: "flex", justifyContent: "center" }}><Socials sz={15} color="#bbb"/></div>
        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "#ccc" }}>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        </div>
        <div style={{ fontSize: 10, color: "#ddd", marginTop: 6 }}>{t("footer.credit")} <span style={{ fontWeight: 600, color: "#bbb" }}>Zipper</span></div>
      </div>
    </footer>
  );
}
