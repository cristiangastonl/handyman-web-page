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
//   - el contenido va en columna, centrado a los costados.
// El test "las bandas tienen el contenido centrado arriba-abajo" lo mide por
// píxeles en cada una.

export default function BandaCentrada({ py = 32, px = 28, style, children, ...rest }) {
  return (
    <div
      {...rest}
      className={["banda-centrada", rest.className].filter(Boolean).join(" ")}
      style={{
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        textAlign: "center",
        ...style,
        padding: `${py}px ${px}px`,
      }}
    >
      {children}
    </div>
  );
}
