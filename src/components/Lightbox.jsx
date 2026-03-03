import { useEffect, useRef, useCallback } from "react";

export default function Lightbox({ item, onClose }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    // Focus the close button on open
    if (closeRef.current) closeRef.current.focus();
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  // Simple focus trap
  const handleKeyDown = useCallback((e) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  if (!item) return null;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" onClick={onClose} onKeyDown={handleKeyDown} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", maxWidth: 660, width: "100%", maxHeight: "90vh" }}>
        {item.type === "video" ? (
          <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
            <iframe src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1`} title="Video player" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        ) : (
          <img src={item.src} alt={item.title || "Handyman project in Zurich"} style={{ width: "100%", display: "block" }}/>
        )}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
          {item.desc && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{item.desc}</div>}
        </div>
      </div>
      <button ref={closeRef} onClick={onClose} aria-label="Close lightbox" style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>×</button>
    </div>
  );
}
