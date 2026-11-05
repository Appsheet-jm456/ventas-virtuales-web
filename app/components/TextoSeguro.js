import { bloquesDe, enLinea } from "../../lib/texto-seguro";

// Dibuja el «texto seguro» (lib/texto-seguro.js) con elementos de React: no hay HTML del dueño
// que interpretar, React escapa todo. Sirve en el servidor (web) y en el navegador (vista previa).
const Linea = ({ partes }) => partes.map((p, i) => (p.b ? <strong key={i}>{p.t}</strong> : <span key={i}>{p.t}</span>));

export default function TextoSeguro({ texto, className = "" }) {
  const bloques = bloquesDe(texto);
  if (!bloques.length) return null;
  return (
    <div className={`texto-seguro ${className}`.trim()}>
      {bloques.map((b, i) => {
        if (b.tipo === "h") return <h3 key={i}><Linea partes={b.partes} /></h3>;
        if (b.tipo === "ul") return <ul key={i}>{b.items.map((it, j) => <li key={j}><Linea partes={it} /></li>)}</ul>;
        return <p key={i}><Linea partes={b.partes} /></p>;
      })}
    </div>
  );
}

// Una sola línea con **negrita** (el resumen destacado).
export function LineaSegura({ texto }) {
  return <Linea partes={enLinea(String(texto ?? "").replace(/\s+/g, " ").trim())} />;
}
