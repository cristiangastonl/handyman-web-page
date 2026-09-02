import { useRef, useState, useEffect, useCallback } from "react";
import { R, ab, itemThumb } from "../lib/constants";
import { useCarouselSpeed } from "../lib/carouselSpeed";

// El ancho es fijo, no un rango. Con minWidth/maxWidth lo decidía el contenido:
// una tarjeta con título largo se estiraba a 320 y una de título corto se quedaba
// en 280. Como el alto de la foto es un porcentaje del ancho, la tarjeta ancha
// tenía la foto más alta, y como el track es flex las demás se estiraban hasta
// ella y les sobraba aire abajo. Era el título largo estirando la foto.
const CARD_W = 280;
const CARD_GAP = 12;
const CARD_WIDTH = CARD_W + CARD_GAP; // lo que avanza el carrusel por tarjeta

// Anibal pidió que las tarjetas no se estiren según el texto más largo: todas
// miden igual y lo que sobra se corta con puntos suspensivos. Son 2 renglones de
// título y 2 de texto, pero como TECHO, no como altura fija: con la altura quemada
// una tarjeta de título corto igual reservaba el lugar de todos los renglones y
// quedaban ~65px de aire adentro ("los espacios", 31/08). Con max-height el texto
// ocupa lo que necesita, el tope evita que un título largo agrande la fila, y las
// tarjetas terminan todas a la misma altura porque el track las estira.
//
// Eran 3 y 3 hasta el 01/09. Bajaron a 2 y 2 porque el carrusel avanza solo: "no
// hay tiempo fisico de leer tanto, si quieren leer q pinchen". El texto acá es un
// rótulo para reconocer la foto, no la descripción del trabajo — esa está en el
// detalle. Si vuelve a pedir menos, el piso que dejó dicho es 1 de título y 2 de texto.
const TITLE_FONT = 13, TITLE_LH = 1.3, TITLE_LINES = 2;
const DESC_FONT = 11, DESC_LH = 1.4, DESC_LINES = 2;
const TITLE_BLOCK = Math.round(TITLE_FONT * TITLE_LH * TITLE_LINES); // 34
const DESC_BLOCK = Math.round(DESC_FONT * DESC_LH * DESC_LINES);     // 31

// Un arrastre no debería abrir el detalle, pero un click sí. 6px separa las dos
// intenciones sin que un temblor de mano cuente como arrastre.
const DRAG_THRESHOLD = 6;

const clampLines = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

export default function Carousel({
  items,
  onClickItem,
  autoPlay = true,
  // Multiplicador sobre la velocidad global. Ver SPEED_FACTORS en carouselSpeed.js.
  speedFactor = 1,
  // Todos arrancan en una foto al azar menos Recent Works, que tiene que abrir
  // sí o sí por el trabajo más nuevo.
  randomStart = true,
}) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const isDragging = useRef(false);
  const moved = useRef(false);
  const dragStart = useRef({ x: 0, pos: 0 });

  // px por frame — el valor lo fija carouselSpeed.js, ya elegido por el cliente.
  const speed = useCarouselSpeed(speedFactor);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Duplicate items for seamless loop (need at least 2 sets)
  const loopItems = items.length > 0 ? [...items, ...items, ...items] : [];
  const singleSetWidth = items.length * CARD_WIDTH;

  // Arranque en una tarjeta al azar. Corre una sola vez y recién cuando los
  // items llegaron de Supabase: en el primer render la lista todavía está vacía
  // y el azar se calcularía siempre sobre cero.
  const didOffset = useRef(false);
  useEffect(() => {
    if (didOffset.current || !randomStart || items.length <= 1) return;
    didOffset.current = true;
    posRef.current = Math.floor(Math.random() * items.length) * CARD_WIDTH;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${-posRef.current}px)`;
  }, [randomStart, items.length]);

  const animate = useCallback(() => {
    if (!trackRef.current || paused || isDragging.current || singleSetWidth === 0) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }
    // Se lee del ref para que mover el slider no corte la animación en curso.
    posRef.current += speedRef.current;
    // Reset position seamlessly when we've scrolled one full set
    if (posRef.current >= singleSetWidth) {
      posRef.current -= singleSetWidth;
    }
    trackRef.current.style.transform = `translateX(${-posRef.current}px)`;
    animRef.current = requestAnimationFrame(animate);
  }, [paused, singleSetWidth]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate, autoPlay, items.length]);

  // Drag/swipe support
  const onPointerDown = (e) => {
    isDragging.current = true;
    moved.current = false;
    dragStart.current = { x: e.clientX, pos: posRef.current };
    // Sin setPointerCapture a propósito: con la captura puesta el navegador
    // dispara el click sobre el track y no sobre la tarjeta, así que el detalle
    // no se abría nunca. Lo que reemplaza a la captura es onPointerLeave.
  };

  const onPointerMove = (e) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = dragStart.current.x - e.clientX;
    if (Math.abs(dx) > DRAG_THRESHOLD) moved.current = true;
    let newPos = dragStart.current.pos + dx;
    if (newPos < 0) newPos += singleSetWidth;
    if (newPos >= singleSetWidth) newPos -= singleSetWidth;
    posRef.current = newPos;
    trackRef.current.style.transform = `translateX(${-posRef.current}px)`;
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  const scroll = (dir) => {
    if (!trackRef.current || singleSetWidth === 0) return;
    // Smooth scroll by one card width
    const target = posRef.current + dir * CARD_WIDTH;
    const start = posRef.current;
    const duration = 400;
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
      let pos = start + (target - start) * ease;
      if (pos >= singleSetWidth) pos -= singleSetWidth;
      if (pos < 0) pos += singleSetWidth;
      posRef.current = pos;
      if (trackRef.current) trackRef.current.style.transform = `translateX(${-pos}px)`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (items.length === 0) return null;

  return (
    <div style={{ position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => { setTimeout(() => setPaused(false), 5000); }}>
      <div
        ref={trackRef}
        style={{ display: "flex", gap: CARD_GAP, alignItems: "stretch", willChange: "transform", cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}>
        {loopItems.map((item, i) => (
          <div key={`${item.id}-${i}`}
            onClick={() => { if (!moved.current) onClickItem(item); }}
            style={{ width: CARD_W, flex: "0 0 auto", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s", userSelect: "none" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,120,31,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "relative", paddingTop: "62%" }}>
              <img src={itemThumb(item)} alt={item.title} loading="lazy" draggable={false}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
              {(item.type === "video" || item.type === "facebook") && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill={R}><path d="M6 4l10 6-10 6V4z"/></svg>
                  </div>
                </div>
              )}
            </div>
            {/* Sin descripción no se renderiza el div: el alto parejo ya no depende de
                reservar espacio, lo da el stretch del track. */}
            <div style={{ padding: "9px 12px 11px" }}>
              <div style={{ fontSize: TITLE_FONT, fontWeight: 600, lineHeight: TITLE_LH, maxHeight: TITLE_BLOCK, ...clampLines(TITLE_LINES) }}>{item.title}</div>
              {item.desc && <div style={{ fontSize: DESC_FONT, color: "#777", marginTop: 3, lineHeight: DESC_LH, maxHeight: DESC_BLOCK, ...clampLines(DESC_LINES) }}>{item.desc}</div>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll(-1)} style={ab("left")} aria-label="Previous">&#8249;</button>
      <button onClick={() => scroll(1)} style={ab("right")} aria-label="Next">&#8250;</button>
    </div>
  );
}
