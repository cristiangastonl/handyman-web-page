import { useRef } from "react";
import { R, ab, ytThumb } from "../lib/constants";

export default function Carousel({ items, onClickItem }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} className="hs" style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
        {items.map(item => (
          <div key={item.id} onClick={() => onClickItem(item)}
            style={{ minWidth: 280, maxWidth: 320, flexShrink: 0, borderRadius: 10, overflow: "hidden", cursor: "pointer", scrollSnapAlign: "start", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,120,31,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "relative", paddingTop: "62%" }}>
              <img src={item.type === "video" ? ytThumb(item) : item.src} alt={item.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
              {item.type === "video" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill={R}><path d="M6 4l10 6-10 6V4z"/></svg>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "9px 12px 11px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
              {item.desc && <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{item.desc}</div>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll(-1)} style={ab("left")}>&#8249;</button>
      <button onClick={() => scroll(1)} style={ab("right")}>&#8250;</button>
    </div>
  );
}
