"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { norm } from "../../lib/productos";

// Barra de categorías del menú principal (HU-31): «☰ Todas las categorías» (despliega la lista
// completa con imagen y conteo), cada categoría visible de /admin/categorias, «Más ▾» con las que
// no caben y «Todos». En celular las categorías se deslizan y «☰» abre la lista a pantalla completa.

const href = (c) => `/productos?categoria=${encodeURIComponent(c.filtro)}`;
const esMovil = () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;
const conPuntero = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Desplegable accesible: Enter/Espacio abre, flechas recorren, Escape cierra y devuelve el foco.
function useDesplegable() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null), boton = useRef(null);
  const porPuntero = useRef(0); // cuándo lo abrió el puntero: el clic que sigue no debe cerrarlo
  const alternar = () => {
    if (Date.now() - porPuntero.current < 800) { porPuntero.current = 0; setAbierto(true); return; }
    setAbierto((a) => !a);
  };
  const puntero = (v) => { if (!conPuntero() || esMovil()) return; if (v) porPuntero.current = Date.now(); setAbierto(v); };
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);
  function teclas(e) {
    if (e.key === "Escape" && abierto) { e.preventDefault(); setAbierto(false); boton.current?.focus(); return; }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const mover = () => {
      const ops = [...(caja.current?.querySelectorAll("[data-op]") || [])];
      if (!ops.length) return;
      const i = ops.indexOf(document.activeElement);
      ops[e.key === "ArrowDown" ? (i + 1) % ops.length : (i <= 0 ? ops.length - 1 : i - 1)].focus();
    };
    if (abierto) mover(); else { setAbierto(true); requestAnimationFrame(mover); }
  }
  return { abierto, setAbierto, caja, boton, teclas, alternar, puntero };
}

export function BarraCategorias({ categorias = [], activa = null }) {
  const todas = useDesplegable();
  const mas = useDesplegable();
  const fila = useRef(null), medidor = useRef(null), izq = useRef(null), der = useRef(null);
  const [caben, setCaben] = useState(categorias.length);
  const cerrar = () => { todas.setAbierto(false); mas.setAbierto(false); };

  // Cuántas categorías caben en la barra (escritorio); las demás pasan a «Más ▾».
  useIsoLayout(() => {
    const medir = () => {
      if (esMovil() || !fila.current || !medidor.current) { setCaben(categorias.length); return; }
      const ancho = fila.current.parentElement.clientWidth - (izq.current?.offsetWidth || 0) - (der.current?.offsetWidth || 0) - 24;
      const anchos = [...medidor.current.children].map((el) => el.offsetWidth);
      const total = anchos.reduce((a, b) => a + b, 0);
      if (total <= ancho) { setCaben(anchos.length); return; }
      let usado = 96; // espacio para «Más ▾»
      let n = 0;
      for (const w of anchos) { if (usado + w > ancho) break; usado += w; n++; }
      setCaben(n);
    };
    medir();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
    if (fila.current) ro?.observe(fila.current.parentElement);
    return () => ro?.disconnect();
  }, [categorias.length]);

  const enBarra = categorias.slice(0, caben), sobran = categorias.slice(caben);
  const esActiva = (c) => activa !== null && activa !== "" && norm(c.filtro) === activa;
  const sobraActiva = sobran.some(esActiva);
  const hover = (d, v) => () => d.puntero(v);

  return (
    <div className="wrap hd-nav-in bc" onClick={(e) => { if (e.target.closest("a")) cerrar(); }}>
      {categorias.length > 0 && (
        <div className={`bc-todas${todas.abierto ? " abierto" : ""}`} ref={(el) => { todas.caja.current = el; izq.current = el; }}
          onKeyDown={todas.teclas} onMouseEnter={hover(todas, true)} onMouseLeave={hover(todas, false)}>
          <button type="button" ref={todas.boton} className="bc-pildora" aria-expanded={todas.abierto} aria-controls="bc-lista-todas"
            onClick={todas.alternar}>
            <span className="bc-ham" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></span>
            <span className="bc-pildora-larga">Todas las categorías</span><span className="bc-pildora-corta">Categorías</span>
          </button>
          <div className="bc-panel" id="bc-lista-todas" hidden={!todas.abierto} role="dialog" aria-label="Todas las categorías">
            <div className="bc-panel-cab">
              <b>Categorías</b>
              <button type="button" className="bc-cerrar" onClick={() => { todas.setAbierto(false); todas.boton.current?.focus(); }} aria-label="Cerrar categorías">✕</button>
            </div>
            <ul className="bc-panel-lista">
              {categorias.map((c) => (
                <li key={c.filtro}>
                  <Link href={href(c)} data-op aria-current={esActiva(c) ? "page" : undefined} className={esActiva(c) ? "activa" : undefined}>
                    <span className="bc-img" aria-hidden="true">{c.img ? <img src={c.img} alt="" loading="lazy" /> : "💻"}</span>
                    <span className="bc-nombre">{c.nombre}</span>
                    {typeof c.total === "number" && <span className="bc-n">{c.total}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="bc-panel-pie">
              <Link href="/productos" data-op>Ver todos los productos</Link>
              <Link href="/categorias" data-op>Ver categorías con fotos</Link>
            </div>
          </div>
        </div>
      )}

      <ul className="bc-fila" ref={fila} aria-label="Categorías">
        {enBarra.map((c) => (
          <li key={c.filtro}><Link href={href(c)} aria-current={esActiva(c) ? "page" : undefined} className={esActiva(c) ? "activa" : undefined}>{c.nombre}</Link></li>
        ))}
      </ul>
      {/* Copia invisible para medir el ancho de cada categoría. */}
      <ul className="bc-fila bc-medidor" ref={medidor} aria-hidden="true">
        {categorias.map((c) => <li key={c.filtro}><span>{c.nombre}</span></li>)}
      </ul>

      <div className="bc-der" ref={der}>
        {sobran.length > 0 && (
          <div className={`bc-mas${mas.abierto ? " abierto" : ""}`} ref={mas.caja} onKeyDown={mas.teclas} onMouseEnter={hover(mas, true)} onMouseLeave={hover(mas, false)}>
            <button type="button" ref={mas.boton} className={sobraActiva ? "activa" : undefined} aria-expanded={mas.abierto} aria-controls="bc-lista-mas" onClick={mas.alternar}>
              Más <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <ul className="bc-mas-lista" id="bc-lista-mas" hidden={!mas.abierto}>
              {sobran.map((c) => <li key={c.filtro}><Link href={href(c)} data-op aria-current={esActiva(c) ? "page" : undefined} className={esActiva(c) ? "activa" : undefined}>{c.nombre}</Link></li>)}
            </ul>
          </div>
        )}
        <Link href="/productos" className={`bc-todos${activa === "" ? " activa" : ""}`} aria-current={activa === "" ? "page" : undefined}>Todos</Link>
      </div>
      {todas.abierto && <div className="bc-fondo" aria-hidden="true" onClick={() => todas.setAbierto(false)} />}
    </div>
  );
}

// Lee la categoría activa de la dirección (necesita Suspense en el layout).
// activa: null = no estamos en el catálogo; "" = catálogo sin categoría («Todos»).
export default function BarraCategoriasActiva({ categorias }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const activa = pathname === "/productos" ? norm(sp.get("categoria") || "") : null;
  return <BarraCategorias categorias={categorias} activa={activa} />;
}
