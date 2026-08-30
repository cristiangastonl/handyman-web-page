import { itemThumb } from "../lib/constants";
import { useAnimationDuration } from "../lib/carouselSpeed";

// Duración base del riel, en segundos (la del CSS en constants.js).
const RAIL_SECONDS = 40;

/**
 * Happy Customers — fotos de Anibal con sus clientes, en /reviews.
 *
 * Son piezas que él compone aparte: la selfie ya viene con marco decorativo,
 * texto y logo quemados en la imagen. No son portfolio y tienen tabla propia
 * (happy-customers-migration.sql).
 *
 * Dos caras del mismo contenido, según el ancho:
 *
 *   desktop (≥1300px) — dos rieles fijos en los márgenes del viewport, fuera
 *     del contenedor de 940px. Se desplazan lento y cruzados, y acompañan todo
 *     el scroll sin robarle ni un pixel de ancho a las reviews.
 *   mobile / tablet   — no hay márgenes, así que las fotos se intercalan entre
 *     las reviews. Es la única forma de que acompañen el scroll y no queden
 *     todas amontonadas arriba.
 */

/**
 * Sin borde, sin esquinas redondeadas y sin recorte, a propósito: cada foto ya
 * trae su propio marco y el texto y el logo adentro. Un `objectFit: cover` le
 * cortaba justo el texto de arriba y el logo de abajo, que es lo que hace que
 * la pieza funcione.
 */
const PhotoTile = ({ item, onClick }) => {
  const src = itemThumb(item);
  if (!src) return null;
  return (
    <div
      onClick={onClick}
      style={{ cursor: "pointer", flexShrink: 0, transition: "transform .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
    >
      <img
        src={src}
        alt={item.alt_text || "Anibal with a happy customer in Zurich"}
        loading="lazy"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </div>
  );
};

/**
 * Riel pegado a un margen del viewport. El track se duplica y viaja -50%, así
 * el loop no muestra la costura al reiniciar.
 */
const EdgeRail = ({ col, side, setLb }) => {
  // 40s es la duración base del riel; useAnimationDuration la acorta con la
// velocidad global que eligió el cliente (carouselSpeed.js).
  const animationDuration = useAnimationDuration(RAIL_SECONDS);
  return (
  <div className={`hc-edges ${side}`}>
    <div className="hc-edge-scroll">
      <div className={`hc-marquee-track${side === "right" ? " down" : ""}`} style={{ animationDuration }}>
        {[...col, ...col].map((it, i) => (
          <PhotoTile key={i} item={it} onClick={() => setLb?.(it, col)}/>
        ))}
      </div>
    </div>
  </div>
  );
};

/** Los dos rieles de desktop. En mobile el CSS los oculta enteros. */
export default function HappyCustomerRails({ items = [], setLb }) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);
  return (
    <>
      <EdgeRail col={items.slice(0, half)} side="left" setLb={setLb}/>
      <EdgeRail col={items.slice(half)} side="right" setLb={setLb}/>
    </>
  );
}

/**
 * Tile para intercalar en la grilla de reviews (mobile). Sin epígrafe: la foto
 * ya trae su texto adentro y repetirlo afuera se leía como un pie duplicado.
 * En desktop el CSS lo esconde, porque ahí el contenido vive en los rieles.
 */
export function HappyCustomerTile({ item, setLb, context }) {
  return (
    <div className="hc-inline-tile">
      <PhotoTile item={item} onClick={() => setLb?.(item, context)}/>
    </div>
  );
}
