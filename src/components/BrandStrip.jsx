import { useTranslation } from "react-i18next";
import { FadeIn } from "./FadeIn";
import { useAnimationDuration } from "../lib/carouselSpeed";

// Duración base del marquee, en segundos (la del CSS en constants.js).
// Subió de 25 a 50 al pasar a las piezas de Anibal: el riel mide casi el triple
// de ancho que con los logos pelados, así que a 25s la velocidad lineal se
// triplicaba. 50s deja los px/s apenas por encima de los originales; sobre eso
// corre el multiplicador global que eligió el cliente (carouselSpeed.js).
const STRIP_SECONDS = 50;

// Las piezas las compone Anibal: el logo ya viene con su marco naranja quemado
// en la imagen, igual que las de Happy Customers. Por eso no se les aplica
// escala de grises — el marco es parte del diseño y en gris se apaga.
// Están normalizadas a 128 px de alto (64 en pantalla, x2 para retina), así
// todas pesan lo mismo en el riel; el ancho queda libre porque las formas van
// de 1.5:1 a 3.6:1 y forzarlas a una caja común las deformaría.
const BRAND_HEIGHT = 64;

const BRANDS = [
  { name: "Bosch Professional", file: "bosch.jpg" },
  { name: "PB Swiss Tools", file: "pb-swiss-tools.jpg" },
  { name: "Stanley", file: "stanley.jpg" },
  { name: "Fischer", file: "fischer.jpg" },
  { name: "Strauss", file: "strauss.jpg" },
  { name: "WAGO", file: "wago.jpg" },
  { name: "Laserliner", file: "laserliner.jpg" },
  { name: "3M", file: "3m.jpg" },
  { name: "Tesa", file: "tesa.jpg" },
];

// Duplicate list for seamless infinite scroll
const ITEMS = [...BRANDS, ...BRANDS];

export default function BrandStrip() {
  const { t } = useTranslation();
  const animationDuration = useAnimationDuration(STRIP_SECONDS);
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
          <div className="brand-marquee" style={{ animationDuration }}>
            {ITEMS.map((b, i) => (
              <div key={i} style={{ height: BRAND_HEIGHT, display: "flex", alignItems: "center", flexShrink: 0 }}>
                <img
                  src={`/brands/anibal/${b.file}`}
                  alt={b.name}
                  loading="lazy"
                  style={{ height: BRAND_HEIGHT, width: "auto", display: "block", borderRadius: 3, transition: "transform 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
