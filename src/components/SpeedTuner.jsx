// Panel para elegir la velocidad de los carruseles mirándolos.
//
// No es parte del sitio: sólo aparece si se entra con ?tune=1, y se apaga
// con ?tune=0 o con la X. Cuando el cliente diga qué número le gusta, se
// fija ese valor y este componente se borra junto con lib/carouselSpeed.

import { useState } from "react";
import { R } from "../lib/constants";
import {
  MIN_MULTIPLIER, MAX_MULTIPLIER, DEFAULT_MULTIPLIER,
  useMultiplier, setMultiplier, resetMultiplier,
  toPixelsPerSecond, disableTuner,
} from "../lib/carouselSpeed";

const PRESETS = [
  { m: 1, label: "Original" },
  { m: 2, label: "Doble" },
  { m: 3, label: "Triple" },
  { m: 4.5, label: "Rápido" },
];

export default function SpeedTuner() {
  const multiplier = useMultiplier();
  const [open, setOpen] = useState(true);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const close = () => { disableTuner(); setHidden(true); };

  const chip = (active) => ({
    flex: 1,
    padding: "5px 4px",
    borderRadius: 999,
    border: `1px solid ${active ? R : "#ddd"}`,
    background: active ? R : "#fff",
    color: active ? "#fff" : "#555",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    lineHeight: 1.2,
  });

  return (
    <div style={{
      position: "fixed", left: 16, bottom: 16, zIndex: 10000,
      width: open ? 268 : "auto",
      background: "#fff",
      border: "1px solid #e6e6e6",
      borderRadius: 12,
      boxShadow: "0 10px 34px rgba(0,0,0,0.14)",
      fontFamily: "inherit",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: open ? "10px 12px 8px" : "8px 12px",
        borderBottom: open ? "1px solid #f0f0f0" : "none",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: R, flexShrink: 0 }}/>
        <strong style={{ fontSize: 12.5, flex: 1, whiteSpace: "nowrap" }}>
          Velocidad carruseles
        </strong>
        <button onClick={() => setOpen(!open)} aria-label={open ? "Minimizar" : "Abrir"}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#999", fontSize: 15, lineHeight: 1, padding: 2 }}>
          {open ? "–" : "+"}
        </button>
        <button onClick={close} aria-label="Cerrar"
          style={{ border: "none", background: "none", cursor: "pointer", color: "#999", fontSize: 15, lineHeight: 1, padding: 2 }}>
          &times;
        </button>
      </div>

      {open && (
        <div style={{ padding: "12px 12px 14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: R, lineHeight: 1 }}>
              {multiplier.toFixed(1)}&times;
            </span>
            <span style={{ fontSize: 11.5, color: "#888" }}>
              {toPixelsPerSecond(multiplier)} px/s
            </span>
          </div>

          <input
            type="range"
            min={MIN_MULTIPLIER}
            max={MAX_MULTIPLIER}
            step={0.1}
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            aria-label="Velocidad de los carruseles"
            style={{ width: "100%", accentColor: R, cursor: "pointer", margin: "0 0 10px" }}
          />

          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {PRESETS.map((p) => (
              <button key={p.m} onClick={() => setMultiplier(p.m)}
                style={chip(Math.abs(multiplier - p.m) < 0.05)}>
                {p.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 11, color: "#999", lineHeight: 1.45, margin: "0 0 8px" }}>
            Mové el slider hasta que te guste y pasame el número. Afecta todo
            lo que se mueve solo: la portada, las marcas y las fotos de
            /reviews.
          </p>

          <button onClick={resetMultiplier}
            disabled={multiplier === DEFAULT_MULTIPLIER}
            style={{
              width: "100%", padding: "7px 0", borderRadius: 8,
              border: "1px solid #e2e2e2", background: "#fafafa",
              fontSize: 11.5, fontWeight: 600,
              color: multiplier === DEFAULT_MULTIPLIER ? "#bbb" : "#666",
              cursor: multiplier === DEFAULT_MULTIPLIER ? "default" : "pointer",
            }}>
            Volver al original
          </button>
        </div>
      )}
    </div>
  );
}
