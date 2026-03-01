import { WA_LINK, svgP } from "../lib/constants";

export default function WhatsAppFAB() {
  return (
    <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 900,
        width: 56, height: 56, borderRadius: "50%",
        background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(37,211,102,0.4)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,0.4)"; }}
      aria-label="Contact via WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
    </a>
  );
}
