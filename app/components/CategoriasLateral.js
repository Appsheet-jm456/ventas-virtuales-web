import Link from "next/link";
import { norm } from "../../lib/productos";

// Columna «Categorías» a la izquierda del banner del Inicio, como la imagen del cliente (ajuste de
// HU-38, 14 nov). Lista las categorías de /admin/categorias con un icono de línea según su nombre
// y, al final, «Por marca» con las marcas publicadas (se abre al pasar el mouse o con el teclado).
// Solo en escritorio: en celular las categorías están en «☰ Categorías» del menú.

const ICONOS = [
  [/tiny|mini/, <><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7 12h4M16 12h1" /></>],
  [/torre|sff|\bmt\b|desktop|escritorio/, <><rect x="7" y="2.5" width="10" height="19" rx="1.5" /><path d="M10 6h4M12 17v.01" /></>],
  [/workstation|estacion/, <><path d="M12 3 3 8l9 5 9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>],
  [/gamer|gaming|diseno/, <><path d="M6 9h12a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L15 14H9l-1.8 2A3 3 0 0 1 2 14v-1a4 4 0 0 1 4-4z" /><path d="M7 11.5v3M5.5 13h3M16 12h.01M18 14h.01" /></>],
  [/monitor|pantalla/, <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M9 20h6M12 16v4" /></>],
  [/tablet|ipad/, <><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M11 18h2" /></>],
  [/all in one|todo en uno|aio/, <><rect x="2.5" y="3" width="19" height="13" rx="1.5" /><path d="M2.5 13h19M8 21h8M12 16v5" /></>],
  [/parte|accesorio|componente|ram|ssd/, <><rect x="6" y="6" width="12" height="12" rx="1.5" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>],
  [/portatil|laptop/, <><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20l-1.5-4h-17z" /></>],
];
const iconoDe = (nombre) => ICONOS.find(([re]) => re.test(norm(nombre)))?.[1]
  || <><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20l-1.5-4h-17z" /></>;

const Icono = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const Chevron = () => (
  <svg className="cl-flecha" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);

export default function CategoriasLateral({ categorias = [], marcas = [] }) {
  if (!categorias.length) return null;
  return (
    <nav className="cl" aria-label="Categorías">
      <h2 className="cl-titulo">Categorías</h2>
      <ul className="cl-lista">
        {categorias.map((c) => (
          <li key={c.filtro}>
            <Link href={`/productos?categoria=${encodeURIComponent(c.filtro)}`}>
              <span className="cl-ico"><Icono>{iconoDe(`${c.nombre} ${c.filtro}`)}</Icono></span>
              <span className="cl-nombre">{c.nombre}</span>
              <Chevron />
            </Link>
          </li>
        ))}
        {marcas.length > 0 && (
          <li className="cl-marca">
            <Link href="/productos" aria-haspopup="true">
              <span className="cl-ico"><Icono><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></Icono></span>
              <span className="cl-nombre">Por marca</span>
              <Chevron />
            </Link>
            <ul className="cl-marcas" aria-label="Marcas">
              {marcas.map((m) => (
                <li key={m.valor}>
                  <Link href={`/productos?marca=${encodeURIComponent(m.valor)}`}>{m.nombre} <span className="bc-n">{m.total}</span></Link>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
}
