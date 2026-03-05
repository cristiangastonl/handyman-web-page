import { useState } from "react";
import { svgP } from "../lib/constants";

const SHARE_URL = "https://handyman-zurich.ch";
const SHARE_TEXT = "Check out this professional handyman service in Zurich!";

export default function ShareBar() {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
    } catch {
      const input = document.createElement("input");
      input.value = SHARE_URL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const encodedUrl = encodeURIComponent(SHARE_URL);
  const encodedText = encodeURIComponent(SHARE_TEXT);

  const btnStyle = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 600, color: "#fff", textDecoration: "none",
    transition: "opacity .2s",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
      <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        style={{ ...btnStyle, background: "#25D366" }} aria-label="Share on WhatsApp"
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
        WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        style={{ ...btnStyle, background: "#1877F2" }} aria-label="Share on Facebook"
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.fb}/></svg>
        Facebook
      </a>
      <button onClick={copyLink}
        style={{ ...btnStyle, background: copied ? "#4CAF50" : "#666" }} aria-label="Copy link"
        onMouseEnter={e => { if (!copied) e.currentTarget.style.opacity = "0.85"; }}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
