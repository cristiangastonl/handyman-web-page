// src/components/BandaCentrada.jsx
//
// Caja con el contenido centrado arriba-abajo y a los costados, con el mismo aire
// arriba que abajo. La usan las bandas de la home (Service Areas, "Need something
// specific?", "Ready to get started?") y los cierres de /portfolio y /faq.
//
// Existe porque Anibal marcó varias veces (13/10/2026) cajas descentradas, y cada
// una tenía su propio relleno y sus márgenes a mano: arreglar una no arreglaba las
// otras, y mover algo las volvía a descentrar. Gastón propuso sacarlas a un
// componente aparte "para que no dependan de otras cosas y siempre estén
// centradas". Lo que asegura el centrado:
//   - el relleno es uno solo (`py`) y vale igual arriba y abajo;
//   - la clase .banda-centrada recorta el aire invisible de cada renglón de texto
//     (text-box en constants.js), que era lo que corría el contenido para abajo;
//   - el contenido va en columna, centrado a los costados;
//   - si la fuente del primer texto miente sobre su altura de mayúscula, se le suma
//     arriba lo que sobresale (ver alturaQueMiente).
// El test "las bandas tienen el contenido centrado arriba-abajo" lo mide por
// píxeles en cada una.

import { useLayoutEffect, useRef, useState } from "react";

// text-box recorta a la altura de mayúscula que DECLARA la fuente. Con DM Sans es
// la real, pero Caveat (la de los títulos de las bandas, elegida en el admin)
// declara 18.3 px a 30 px y su H mide 21.7: la tinta asomaba 3.5 px por arriba del
// recorte y la caja quedaba 30 arriba contra 35 abajo (19/10/2026). Devuelve esa
// diferencia en píxeles, 0 si la fuente dice la verdad.
function alturaQueMiente(el) {
  const c = getComputedStyle(el);
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`;
  const real = ctx.measureText("H").actualBoundingBoxAscent;
  const sonda = document.createElement("span");
  sonda.textContent = "H";
  sonda.style.cssText = "display:inline-block;text-box:trim-both cap alphabetic;line-height:normal";
  el.appendChild(sonda);
  const declarada = sonda.getBoundingClientRect().height;
  sonda.remove();
  return Math.max(0, Math.round((real - declarada) * 2) / 2);
}

export default function BandaCentrada({ py = 32, px = 28, style, children, ...rest }) {
  const ref = useRef(null);
  const [extra, setExtra] = useState(0);
  useLayoutEffect(() => {
    let vivo = true;
    const medir = () => {
      const primero = ref.current?.firstElementChild;
      if (!vivo || !primero?.matches("h3, h4, p") || !CSS.supports?.("text-box", "trim-both cap alphabetic")) return;
      const e = alturaQueMiente(primero);
      setExtra(prev => (prev === e ? prev : e));
    };
    medir();
    document.fonts?.ready.then(medir);
    return () => { vivo = false; };
  });
  return (
    <div
      {...rest}
      ref={ref}
      className={["banda-centrada", rest.className].filter(Boolean).join(" ")}
      style={{
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        textAlign: "center",
        ...style,
        padding: `${py + extra}px ${px}px ${py}px`,
      }}
    >
      {children}
    </div>
  );
}
