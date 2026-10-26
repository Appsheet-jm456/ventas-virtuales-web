import TextoSeguro from "./TextoSeguro";
import { cld } from "../../lib/cdn";

// Página «Nosotros» (HU-33): título, bloques de texto con foto a la izquierda o derecha y franja de
// cifras (después del primer bloque). Sirve en la web y en la vista previa del panel. Texto seguro:
// no se interpreta HTML.
function Bloque({ b, i }) {
  return (
    <section className={`nv-bloque${b.imagen ? ` con-foto foto-${b.posicion}` : ""}`} aria-labelledby={`nv-b-${i}`}>
      <div className="nv-texto">
        <h2 id={`nv-b-${i}`}>{b.titulo}</h2>
        <TextoSeguro texto={b.texto} />
      </div>
      {b.imagen && (
        <figure className="nv-foto">
          <img src={cld(b.imagen, "f_auto,q_auto,c_limit,w_1100")} alt={b.alt} loading={i === 0 ? "eager" : "lazy"} />
        </figure>
      )}
    </section>
  );
}

export default function NosotrosVista({ nosotros }) {
  const { titulo, bloques = [], cifras = [] } = nosotros || {};
  const cifrasBloque = cifras.length > 0 && (
    <ul className="nv-cifras" aria-label="Cifras de la empresa">
      {cifras.map((c, i) => <li key={i}><b>{c.valor}</b><span>{c.etiqueta}</span></li>)}
    </ul>
  );
  return (
    <div className="nv">
      <header className="nv-cabeza"><h1>{titulo}</h1></header>
      {bloques.length === 0 && cifrasBloque}
      {bloques.map((b, i) => (
        <div key={i}>
          <Bloque b={b} i={i} />
          {i === 0 && cifrasBloque}
        </div>
      ))}
    </div>
  );
}
