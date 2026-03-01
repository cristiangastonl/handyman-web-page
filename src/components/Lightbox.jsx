export default function Lightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", maxWidth: 660, width: "100%", maxHeight: "90vh" }}>
        {item.type === "video" ? (
          <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
            <iframe src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        ) : (
          <img src={item.src} alt={item.title || "Handyman project in Zurich"} style={{ width: "100%", display: "block" }}/>
        )}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
          {item.desc && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{item.desc}</div>}
        </div>
      </div>
      <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  );
}
