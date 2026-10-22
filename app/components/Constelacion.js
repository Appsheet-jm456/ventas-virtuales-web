// Constelación de la pantalla del logo (guía visual, HU-21): puntos de luz unidos por líneas,
// decorativa y ligera (SVG). Siempre se genera igual para la misma semilla, así el servidor y el
// navegador dibujan lo mismo. En celular se ocultan los puntos marcados como "extra".

function azar(semilla) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Constelacion({ semilla = 7, puntos = 24, ancho = 800, alto = 400, className = "" }) {
  const r = azar(semilla);
  const p = Array.from({ length: puntos }, (_, i) => ({
    x: Math.round(r() * ancho), y: Math.round(r() * alto), t: 1 + r() * 2.4, extra: i % 3 === 2,
  }));
  // Cada punto se une con sus dos vecinos más cercanos.
  const lineas = new Set();
  p.forEach((a, i) => {
    p.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2]).filter(([j]) => j !== i)
      .sort((u, v) => u[1] - v[1]).slice(0, 2)
      .forEach(([j]) => lineas.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  return (
    <svg className={`constelacion ${className}`} viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g className="cn-lineas">
        {[...lineas].map((k) => {
          const [i, j] = k.split("-").map(Number);
          return <line key={k} className={p[i].extra || p[j].extra ? "extra" : undefined} x1={p[i].x} y1={p[i].y} x2={p[j].x} y2={p[j].y} />;
        })}
      </g>
      {p.filter((q) => q.t > 2.6).map((q, i) => <circle key={"h" + i} className="cn-halo" cx={q.x} cy={q.y} r={q.t * 4} />)}
      {p.map((q, i) => <circle key={i} className={`cn-punto${q.extra ? " extra" : ""}`} cx={q.x} cy={q.y} r={q.t} />)}
    </svg>
  );
}
