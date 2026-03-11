import { useRef, useState, useEffect, useCallback } from "react";
import { R, ab, itemThumb } from "../lib/constants";

const CARD_WIDTH = 292; // minWidth + gap
const SPEED = 0.5; // pixels per frame (~30px/sec)

export default function Carousel({ items, onClickItem, autoPlay = true }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, pos: 0 });

  // Duplicate items for seamless loop (need at least 2 sets)
  const loopItems = items.length > 0 ? [...items, ...items, ...items] : [];
  const singleSetWidth = items.length * CARD_WIDTH;

  const animate = useCallback(() => {
    if (!trackRef.current || paused || isDragging.current || singleSetWidth === 0) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }
    posRef.current += SPEED;
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
    dragStart.current = { x: e.clientX, pos: posRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = dragStart.current.x - e.clientX;
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
        style={{ display: "flex", gap: 12, willChange: "transform", cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}>
        {loopItems.map((item, i) => (
          <div key={`${item.id}-${i}`}
            onClick={() => { if (!isDragging.current) onClickItem(item); }}
            style={{ minWidth: 280, maxWidth: 320, flexShrink: 0, borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s", userSelect: "none" }}
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
            <div style={{ padding: "9px 12px 11px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
              {item.desc && <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>{item.desc}</div>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll(-1)} style={ab("left")} aria-label="Previous">&#8249;</button>
      <button onClick={() => scroll(1)} style={ab("right")} aria-label="Next">&#8250;</button>
    </div>
  );
}
