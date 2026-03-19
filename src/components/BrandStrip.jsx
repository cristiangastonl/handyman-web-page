import { useTranslation } from "react-i18next";
import { FadeIn } from "./FadeIn";

const BRANDS = [
  { name: "Bosch Professional", file: "bosch.svg", h: 32 },
  { name: "PB Swiss Tools", file: "pb-swiss-tools.png", h: 18 },
  { name: "Stanley", file: "stanley.svg", h: 22 },
  { name: "Fischer", file: "fischer.png", h: 24 },
  { name: "Strauss", file: "strauss.png", h: 26 },
  { name: "WAGO", file: "wago.svg", h: 22 },
  { name: "Laserliner", file: "laserliner.png", h: 24 },
  { name: "3M", file: "3m.svg", h: 28 },
  { name: "Tesa", file: "tesa.svg", h: 20 },
];

// Duplicate list for seamless infinite scroll
const ITEMS = [...BRANDS, ...BRANDS];

export default function BrandStrip() {
  const { t } = useTranslation();
  return (
    <FadeIn>
      <section style={{ padding: "24px 0 20px", overflow: "hidden", background: "#fafafa", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        <p style={{ textAlign: "center", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", margin: "0 0 16px" }}>
          {t("brands.title", "Trusted Brands We Work With")}
        </p>
        <div style={{ position: "relative", maxWidth: 940, margin: "0 auto", overflow: "hidden" }}>
          {/* Fade edges */}
          <div className="brand-fade-left" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(to right, #fafafa, transparent)", zIndex: 1, pointerEvents: "none" }}/>
          <div className="brand-fade-right" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(to left, #fafafa, transparent)", zIndex: 1, pointerEvents: "none" }}/>
          <div className="brand-marquee">
            {ITEMS.map((b, i) => (
              <div key={i} style={{ width: 100, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img
                  src={`/brands/${b.file}`}
                  alt={b.name}
                  loading="lazy"
                  style={{ maxHeight: b.h, maxWidth: 90, objectFit: "contain", filter: "grayscale(100%) opacity(0.55)", transition: "filter 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.filter = "grayscale(0%) opacity(1)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "grayscale(100%) opacity(0.55)"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
