"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { norm } from "../../lib/productos";

// Menú principal (HU-38, reemplaza la fila de categorías de HU-31): «☰ Todas las categorías»
// (despliega la lista completa con imagen y conteo), «% Ofertas del mes», Nuevos, Usados y
// «Por marca ▾» (Mayoristas, Soporte y Envíos se quitaron por pedido del dueño). En celular la fila se desliza
// y «☰» abre la lista de categorías a pantalla completa.

const href = (c) => `/productos?categoria=${encodeURIComponent(c.filtro)}`;
const esMovil = () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;
const conPuntero = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

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

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
);

// actual: qué está abierto en el catálogo { categoria, estado, marca, ofertas } o null fuera de /productos.
export function BarraCategorias({ categorias = [], marcas = [], actual = null }) {
  const todas = useDesplegable();
  const porMarca = useDesplegable();
  const cerrar = () => { todas.setAbierto(false); porMarca.setAbierto(false); };
  const hover = (d, v) => () => d.puntero(v);

  const cat = actual?.categoria ?? null;
  const esActiva = (c) => cat !== null && cat !== "" && norm(c.filtro) === cat;
  const marcaActiva = actual?.marca || "";
  const marcar = (on) => (on ? { className: "activa", "aria-current": "page" } : {});

  return (
    <div className="wrap hd-nav-in bc" onClick={(e) => { if (e.target.closest("a")) cerrar(); }}>
      {categorias.length > 0 && (
        <div className={`bc-todas${todas.abierto ? " abierto" : ""}`} ref={todas.caja}
          onKeyDown={todas.teclas} onMouseEnter={hover(todas, true)} onMouseLeave={hover(todas, false)}>
          <button type="button" ref={todas.boton} className="bc-pildora" aria-expanded={todas.abierto} aria-controls="bc-lista-todas"
            onClick={todas.alternar}>
            <span className="bc-ham" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></span>
            <span className="bc-pildora-larga">Todas las categorías</span><span className="bc-pildora-corta">Categorías</span>
            <span className="bc-pildora-flecha"><Flecha /></span>
          </button>
          <div className="bc-panel" id="bc-lista-todas" hidden={!todas.abierto} role="dialog" aria-label="Todas las categorías">
            <div className="bc-panel-cab">
              <b>Categorías</b>
              <button type="button" className="bc-cerrar" onClick={() => { todas.setAbierto(false); todas.boton.current?.focus(); }} aria-label="Cerrar categorías">✕</button>
            </div>
            <ul className="bc-panel-lista">
              {categorias.map((c) => (
                <li key={c.filtro}>
                  <Link href={href(c)} data-op {...marcar(esActiva(c))}>
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

      <ul className="bc-fila" aria-label="Menú principal">
        <li>
          <Link href="/productos?ofertas=si" className={`bc-ofertas${actual?.ofertas ? " activa" : ""}`} aria-current={actual?.ofertas ? "page" : undefined}>
            <span className="bc-ofertas-ico" aria-hidden="true">%</span>Ofertas del mes
          </Link>
        </li>
        <li><Link href="/productos?estado=nuevo" {...marcar(actual?.estado === "nuevo")}>Nuevos</Link></li>
        <li><Link href="/productos?estado=usado" {...marcar(actual?.estado === "usado")}>Usados</Link></li>
        {marcas.length > 0 && (
          <li className={`bc-mas${porMarca.abierto ? " abierto" : ""}`} ref={porMarca.caja} onKeyDown={porMarca.teclas}
            onMouseEnter={hover(porMarca, true)} onMouseLeave={hover(porMarca, false)}>
            <button type="button" ref={porMarca.boton} className={marcaActiva ? "activa" : undefined} aria-expanded={porMarca.abierto}
              aria-controls="bc-lista-marcas" onClick={porMarca.alternar}>
              Por marca <Flecha />
            </button>
            <ul className="bc-mas-lista" id="bc-lista-marcas" hidden={!porMarca.abierto}>
              {marcas.map((m) => (
                <li key={m.valor}>
                  <Link href={`/productos?marca=${encodeURIComponent(m.valor)}`} data-op {...marcar(marcaActiva === m.valor)}>
                    {m.nombre} <span className="bc-n">{m.total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>

      {todas.abierto && <div className="bc-fondo" aria-hidden="true" onClick={() => todas.setAbierto(false)} />}
    </div>
  );
}

// Lee de la dirección qué está abierto en el catálogo (necesita Suspense en el layout).
export default function BarraCategoriasActiva(props) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const actual = pathname === "/productos"
    ? {
        categoria: norm(sp.get("categoria") || ""),
        estado: sp.get("estado") || "",
        marca: sp.get("marca") || "",
        ofertas: sp.get("ofertas") === "si",
      }
    : null;
  return <BarraCategorias {...props} actual={actual} />;
}
