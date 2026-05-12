import { useEffect, useRef, useCallback } from "react";
import { fbEmbedUrl, ytId } from "../lib/constants";

export default function Lightbox({ item, items = [], onClose, onNavigate }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  const currentIndex = item && items.length > 0 ? items.findIndex(i => i.id === item.id) : -1;
  const canNavigate = items.length > 1 && currentIndex >= 0;

  const goPrev = useCallback(() => {
    if (!canNavigate || !onNavigate) return;
    const next = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    onNavigate(items[next]);
  }, [canNavigate, onNavigate, items, currentIndex]);
  const goNext = useCallback(() => {
    if (!canNavigate || !onNavigate) return;
    const next = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    onNavigate(items[next]);
  }, [canNavigate, onNavigate, items, currentIndex]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose, goPrev, goNext]);

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
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
  const isFacebook = item.type === "facebook";
  const isVideo = item.type === "video";
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose} onKeyDown={handleKeyDown} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", maxWidth: isFacebook ? 360 : 660, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {isVideo ? (
          <div style={{ position: "relative", paddingTop: "56.25%", background: "#000", flexShrink: 0 }}>
            <iframe src={`https://www.youtube.com/embed/${ytId(item.videoId)}?autoplay=1`} title="Video player" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        ) : isFacebook ? (
          <div style={{ position: "relative", paddingTop: "177.78%", background: "#000", maxHeight: "70vh", flexShrink: 0 }}>
            <iframe src={fbEmbedUrl(item.src)} title="Facebook video" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#000", overflow: "hidden" }}>
            <img src={item.src} alt={item.title || "Handyman project in Zurich"} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}/>
          </div>
        )}
        <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#fff" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
            {item.desc && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{item.desc}</div>}
          </div>
          {canNavigate && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#999" }}>{currentIndex + 1} / {items.length}</span>
              <button onClick={goPrev} aria-label="Previous" style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: 16, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <button onClick={goNext} aria-label="Next" style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: 16, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </div>
          )}
        </div>
      </div>
      <button ref={closeRef} onClick={onClose} aria-label="Close lightbox" style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>×</button>
    </div>
  );
}
