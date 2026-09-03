import { useRef, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { R, svgP, ab, getStyleConfig, parseReviewDate, formatReviewDate, getSocialUrls, getFbReviewsUrl, getGoogleReviewUrl, SECTION_PAD } from "../lib/constants";
import { useCarouselSpeed, SPEED_FACTORS } from "../lib/carouselSpeed";
import { fetchHappyCustomers } from "../lib/supabase";
import { Stars, GoogleG, SocialIcon } from "./ui";
import { FadeIn, AnimatedCounter } from "./FadeIn";
import HappyCustomerRails, { HappyCustomerTile } from "./HappyCustomers";

// "G + f Reviews" se leía como si "Reviews" fuera sólo lo de Facebook: la palabra
// quedaba pegada al ícono azul y el de Google, al otro extremo, no llegaba a
// alcanzarla. Ahora el título va primero y los dos íconos van detrás agrupados en
// una pastilla, que se lee como "estas son las fuentes" y no como parte de la frase.
const sourcePill = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 10px", borderRadius: 999,
  background: "#fff", border: "1px solid #e8e8e8",
};

// Sentido de marcha del carrusel de reseñas de la home.
//   -1 → de izquierda a derecha: las tarjetas entran por el borde izquierdo.
//    1 → de derecha a izquierda, que es como corren los carruseles de fotos.
// Anibal quiso ver las dos. Cambiar el signo alcanza; el wrap del loop funciona
// en los dos sentidos porque contempla los dos bordes.
const REVIEWS_DIR = -1;

// Facebook no da estrellas, da recomendación. El pulgar arriba le da al badge el
// mismo peso visual que las 5 estrellas de una card de Google al lado.
const FbBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#1877F2", fontWeight: 600 }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d={svgP.thumbsUp}/></svg>
    Recommends
  </span>
);

/**
 * Merge both sources into one chronologically sortable list.
 * `sortedAt` is what we order by; `time` is what the card shows (Google's free-text
 * label reads better than a formatted date when it exists). Reviews with no usable
 * date sink to the bottom in either direction so they never displace dated ones.
 */
function useAllReviews(googleReviews, fbReviews, lang, direction = "desc") {
  return useMemo(() => {
    // Sin fallback a datos de ejemplo. Había uno —si google_reviews venía vacía se
    // mostraban las 27 reseñas inventadas de constants.js— y el 03/09 se disparó
    // en producción: Anibal borró las de Google desde el admin y el sitio siguió
    // publicando "Anna M.", "Thomas K." y compañía como si fueran suyas, con un
    // promedio de 4.3 calculado sobre ellas. Un negocio real mostrando testimonios
    // y una calificación fabricados. Si no hay reseñas, no hay reseñas.
    const gReviews = googleReviews.map(r => ({
      name: r.name, r: r.rating, text: r.text, source: "google",
      time: r.time_label || formatReviewDate(r.review_date, lang),
      sortedAt: parseReviewDate(r.review_date) ?? parseReviewDate(r.created_at),
    }));
    const fReviews = fbReviews.map(r => ({
      name: r.name, r: null, text: r.text, source: "facebook", recommends: true,
      time: formatReviewDate(r.review_date, lang),
      sortedAt: parseReviewDate(r.review_date) ?? parseReviewDate(r.created_at),
    }));

    const all = [...gReviews, ...fReviews];
    const sign = direction === "asc" ? 1 : -1;
    return all.slice().sort((a, b) => {
      if (a.sortedAt === null && b.sortedAt === null) return 0;
      if (a.sortedAt === null) return 1;
      if (b.sortedAt === null) return -1;
      return (a.sortedAt - b.sortedAt) * sign;
    });
  }, [googleReviews, fbReviews, lang, direction]);
}

/**
 * Promedio de estrellas. Las de Facebook son pulgar arriba y no puntaje, así que
 * nunca cuentan acá.
 *
 * Devuelve null cuando no hay ninguna reseña puntuada, y quien lo muestra tiene
 * que ocultar el bloque. Antes devolvía "0.0", que en una página de reseñas se
 * lee como "este tipo tiene cero estrellas" — lo contrario de la verdad, que es
 * que todavía no hay ninguna cargada.
 */
export const starAverage = (reviews) => {
  const rated = reviews.filter(r => r.source === "google" && r.r);
  if (rated.length === 0) return null;
  return (rated.reduce((a, r) => a + r.r, 0) / rated.length).toFixed(1);
};

// Unified reviews carousel for the home page (Google + Facebook)
export function GoogleReviewsHome({ nav, googleReviews = [], fbReviews = [], siteConfig = {} }) {
  const { t, i18n } = useTranslation();
  const revTitleStyle = getStyleConfig(siteConfig, "reviews_title_style");
  const revScoreStyle = getStyleConfig(siteConfig, "reviews_score_style");
  const revRef = useRef(null);
  const [expanded, setExpanded] = useState(new Set());
  const [paused, setPaused] = useState(false);
  const toggleExpand = (e, i) => {
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
  // Home always leads with the newest reviews — the asc/desc control lives on /reviews.
  const allReviews = useAllReviews(googleReviews, fbReviews, i18n.language, "desc");
  const avg = starAverage(allReviews);

  // La lista se duplica para que el loop no muestre la costura al reiniciar, igual
  // que en Carousel.jsx. El clon comparte el índice de su original, así que "Read
  // more" abre las dos copias de la misma reseña y no una sí y otra no.
  const base = allReviews.slice(0, 12);
  const loop = base.length > 1 ? [...base, ...base] : base;

  const speed = useCarouselSpeed(SPEED_FACTORS.homeReviews);

  // Se mueve empujando scrollLeft en vez de con un transform: así las flechas, el
  // swipe y la rueda del mouse siguen andando sobre el mismo elemento, sin tener
  // que reimplementarlos. La posición se lleva aparte en un ref porque acumular
  // fracciones de pixel directamente en scrollLeft se pierde con el redondeo.
  const posRef = useRef(0);
  useEffect(() => {
    const el = revRef.current;
    if (!el || base.length <= 1) return;
    let raf;
    const step = () => {
      if (!paused && el.scrollWidth > 0) {
        const unSet = el.scrollWidth / 2;
        // Si alguien scrolleó a mano o tocó una flecha, se retoma desde ahí.
        if (Math.abs(el.scrollLeft - posRef.current) > 2) posRef.current = el.scrollLeft;
        posRef.current += speed * REVIEWS_DIR;
        // Los dos bordes: yendo hacia atrás el navegador clava scrollLeft en 0 y el
        // carrusel se quedaría trabado ahí, así que se salta al final del primer set.
        if (posRef.current >= unSet) posRef.current -= unSet;
        if (posRef.current <= 0) posRef.current += unSet;
        el.scrollLeft = posRef.current;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed, base.length]);

  return (
    <FadeIn>
    <section style={{ padding: SECTION_PAD, background: "#fafafa" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: revTitleStyle.fontSize, fontFamily: `'${revTitleStyle.fontFamily}', sans-serif`, fontWeight: 600, color: "#444" }}>{t("reviews.title")}</span>
              <span style={sourcePill}>
                <GoogleG/>
                <span style={{ fontSize: 11, color: "#ccc" }}>+</span>
                <SocialIcon type="fb" size={16}/>
              </span>
            </div>
            {avg && <div style={{ width: 1, height: 24, background: "#e0e0e0" }}/>}
            {/* center y no baseline: al lado del número hay un bloque de DOS líneas
                (estrellas + "158 reviews"), así que baseline lo pegaba a la línea de
                las estrellas y el 4.8 quedaba 8.7px más arriba que el "Reviews" de la
                izquierda — Anibal lo vio desalineado el 01/09. Centrado contra el
                bloque, su centro cae exactamente en el de la fila. */}
            {avg && <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: revScoreStyle.fontSize, fontFamily: `'${revScoreStyle.fontFamily}', sans-serif`, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1400} decimals={1}/></span>
              {/* textAlign center: el conteo es más angosto que la fila de estrellas,
                  así que sin esto arrancaba pegado al borde izquierdo de ellas y se
                  leía descolgado. Anibal: "lo de 158 reviews deberia centrarse"
                  (02/09). Las estrellas, que son lo más ancho, no se mueven. */}
              <div style={{ textAlign: "center" }}>
                <Stars n={Math.round(parseFloat(avg))} sz={15}/>
                <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>{t("reviews.count", { count: allReviews.length })}</div>
              </div>
            </div>}
          </div>
          <button onClick={() => nav("reviews")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>{t("reviews.seeAll")}</button>
        </div>

        {/* Se frena con el mouse encima y al tocar: si no, no se alcanza a terminar
            de leer una reseña ni a abrir "Read more". Y sin scroll-snap, que peleaba
            con el avance continuo tirando la tarjeta de vuelta a la grilla. */}
        <div style={{ position: "relative" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}>
          <div ref={revRef} className="hs" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
            {loop.map((rev, k) => {
              const i = k % base.length;
              return (
              <div key={k} className="review-card" style={{ minWidth: 280, maxWidth: 310, flexShrink: 0, padding: "18px", borderRadius: 12, background: "#fff", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#fff" }}>{rev.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
                  </div>
                  {rev.source === "google" ? <GoogleG/> : <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d={svgP.fb}/></svg>}
                </div>
                {rev.source === "facebook" ? <FbBadge/> : <Stars n={rev.r} sz={14}/>}
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: "8px 0 0", ...(!expanded.has(i) ? { display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}) }}>{rev.text}</p>
                <span
                  onClick={(e) => toggleExpand(e, i)}
                  style={{ fontSize: 12, color: R, cursor: "pointer", fontWeight: 600, marginTop: 4, display: "inline-block" }}
                >{expanded.has(i) ? t("reviews.readLess", "Read less") : t("reviews.readMore", "Read more")}</span>
              </div>
              );
            })}
          </div>
          <button onClick={() => revRef.current?.scrollBy({ left: -340, behavior: "smooth" })} style={ab("left")} aria-label="Previous">&#8249;</button>
          <button onClick={() => revRef.current?.scrollBy({ left: 340, behavior: "smooth" })} style={ab("right")} aria-label="Next">&#8250;</button>
        </div>
      </div>
    </section>
    </FadeIn>
  );
}

/**
 * Las fotos de Happy Customers sólo se usan en esta página, así que se piden
 * acá y no en la carga inicial de App.jsx — en las otras 3 rutas sería un
 * request muerto. `happyItems` llega por props cuando el admin ya las cargó
 * en memoria; si no, se buscan.
 */
function useHappyCustomers(happyItems) {
  const [loaded, setLoaded] = useState([]);

  useEffect(() => {
    if (happyItems.length > 0) return;
    let alive = true;
    fetchHappyCustomers()
      .then(data => { if (alive && data) setLoaded(data); })
      .catch(err => console.warn("Happy customers load error:", err.message));
    return () => { alive = false; };
  }, [happyItems.length]);

  return useMemo(
    () => (happyItems.length > 0 ? happyItems : loaded).filter(it => it.src || it.thumb),
    [happyItems, loaded],
  );
}

// Una selfie cada tres reviews. Decisión de Anibal, 29/08/2026:
//
//   "Cada diez es bocha. Hay 13 y nadie scrolea 130 reviews. Las imágenes
//    garpan 100 veces más q la review escrita, son fotos reales, en casas
//    reales, cero AI."
//
// Antes el paso se calculaba sobre el largo de la lista para que la última
// foto cayera cerca del final. Con ~160 reviews eso daba una cada diez, y las
// 13 fotos quedaban repartidas por un scroll que nadie hace hasta el fondo.
// El paso fijo las concentra adelante: se agotan alrededor de la review 40 y
// de ahí en adelante quedan sólo reviews escritas. Es el intercambio elegido
// a propósito — que se vean todas vale más que cubrir un final que no se lee.
const REVIEWS_POR_FOTO = 3;

/**
 * Mobile: las fotos se intercalan entre las reviews. En desktop el CSS las
 * oculta — ahí el contenido vive en los rieles de los márgenes.
 */
function interleaveHappy(reviews, photos) {
  if (photos.length === 0) return reviews;
  const out = [];
  let p = 0;
  reviews.forEach((rev, i) => {
    out.push(rev);
    if ((i + 1) % REVIEWS_POR_FOTO === 0 && p < photos.length) out.push({ __photo: photos[p++] });
  });
  return out;
}

// Full reviews page
export function ReviewsPage({ googleReviews = [], fbReviews = [], happyItems = [], setLb, siteConfig = {} }) {
  const { t, i18n } = useTranslation();
  const [direction, setDirection] = useState("desc");
  const happy = useHappyCustomers(happyItems);
  const reviews = useAllReviews(googleReviews, fbReviews, i18n.language, direction);
  const allReviews = reviews;
  const googleOnly = reviews.filter(r => r.source === "google" && r.r);
  const avg = starAverage(reviews);

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
      <HappyCustomerRails items={happy} setLb={setLb}/>
      <div style={{ textAlign: "center", padding: "24px 0 36px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{t("reviews.title")}</span>
          <span style={sourcePill}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span style={{ fontSize: 11, color: "#ccc" }}>+</span>
          <SocialIcon type="fb" size={20}/>
          </span>
        </div>
        {avg && <>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1600} decimals={1}/></div>
          <div style={{ margin: "8px 0 6px" }}><Stars n={Math.round(parseFloat(avg))} sz={22}/></div>
        </>}
        <div style={{ fontSize: 14, color: "#777" }}>{t("reviews.based", { count: allReviews.length })}</div>

        {/* Rating distribution bars (Google only) */}
        <div style={{ maxWidth: 280, margin: "20px auto 0" }}>
          {[5,4,3,2,1].map(star => {
            const count = googleOnly.filter(r => r.r === star).length;
            const pct = googleOnly.length ? (count / googleOnly.length) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#666", width: 12, textAlign: "right" }}>{star}</span>
                <span style={{ fontSize: 11, color: "#F59E0B" }}>★</span>
                <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 3 }}/>
                </div>
                <span style={{ fontSize: 11, color: "#ccc", width: 20 }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Chronological order toggle */}
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setDirection(d => d === "desc" ? "asc" : "desc")}
            aria-label={t("reviews.sortAria", "Change review order")}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#555", transition: "border-color .2s, color .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.color = R; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#555"; }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>{direction === "desc" ? "↓" : "↑"}</span>
            {direction === "desc" ? t("reviews.newestFirst", "Newest first") : t("reviews.oldestFirst", "Oldest first")}
          </button>
        </div>

        {/* Las dos fuentes tienen el mismo peso en las tarjetas, así que también
            lo tienen acá: dejar la reseña en Google era la única opción visible. */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
          {[
            { href: getGoogleReviewUrl(siteConfig), label: t("reviews.leaveReview"), icon: <GoogleG/> },
            { href: getFbReviewsUrl(siteConfig), label: t("reviews.leaveReviewFb"), icon: <SocialIcon type="fb" size={16}/> },
          ].map(b => (
            <a key={b.href} href={b.href} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px", border: "1px solid #ddd", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#555", textDecoration: "none", transition: "border-color .2s, color .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = R; e.currentTarget.style.color = R; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#555"; }}>
              {b.icon}{b.label}
            </a>
          ))}
        </div>
      </div>

      {/* All reviews grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {interleaveHappy(reviews, happy).map((rev, i) => rev.__photo ? (
          <HappyCustomerTile key={`hc${i}`} item={rev.__photo} setLb={setLb} context={happy}/>
        ) : (
          <div key={i} style={{ padding: "20px", borderRadius: 12, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff" }}>{rev.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
              </div>
              {rev.source === "facebook" ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d={svgP.fb}/></svg> : <GoogleG/>}
            </div>
            {rev.source === "facebook" ? <FbBadge/> : <Stars n={rev.r} sz={14}/>}
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: "8px 0 0" }}>{rev.text}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 32, padding: "24px 20px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", marginBottom: 10 }}>{t("reviews.ctaTitle", "Ready to experience the same quality?")}</p>
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("cta.button")}
        </a>
      </div>
    </div>
  );
}
