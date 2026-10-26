"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { norm } from "../../lib/productos";

// «Productos» del menú superior con sus categorías en un desplegable (HU-25). El texto lleva a
// /productos; la flecha (o pasar el puntero) abre la lista, que sale de /admin/categorias.
// Teclado: Enter/Espacio en la flecha abre, flechas recorren, Escape cierra y vuelve a la flecha.
export default function MenuProductos({ categorias = [] }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);
  const flecha = useRef(null);
  const pathname = usePathname();
  const sp = useSearchParams();
  const activa = pathname === "/productos" ? norm(sp.get("categoria") || "") : null;

  // Se cierra al navegar y al hacer clic fuera.
  useEffect(() => { setAbierto(false); }, [pathname, sp]);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  if (!categorias.length) return <Link href="/productos">Productos</Link>;

  const opciones = () => [...(caja.current?.querySelectorAll(".hd-drop-list a") || [])];
  function teclas(e) {
    if (e.key === "Escape" && abierto) {
      e.preventDefault();
      setAbierto(false);
      flecha.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const mover = () => {
      const ops = opciones();
      if (!ops.length) return;
      const i = ops.indexOf(document.activeElement);
      const sig = e.key === "ArrowDown" ? (i + 1) % ops.length : (i <= 0 ? ops.length - 1 : i - 1);
      ops[sig].focus();
    };
    // Con la lista cerrada, se abre y se espera a que sea visible para mover el foco.
    if (abierto) mover();
    else { setAbierto(true); requestAnimationFrame(mover); }
  }

  const enlace = (href, texto, actual) => (
    <li key={href}>
      <Link href={href} onClick={() => setAbierto(false)} aria-current={actual ? "page" : undefined} className={actual ? "activa" : undefined}>{texto}</Link>
    </li>
  );

  return (
    <div className={`hd-drop${abierto ? " abierto" : ""}${activa !== null ? " en-productos" : ""}`} ref={caja} onKeyDown={teclas}
      onMouseEnter={(e) => { if (window.matchMedia("(hover: hover)").matches) setAbierto(true); }}
      onMouseLeave={() => { if (window.matchMedia("(hover: hover)").matches) setAbierto(false); }}>
      <Link href="/productos" className="hd-drop-txt">Productos</Link>
      <button type="button" ref={flecha} className="hd-drop-btn" aria-expanded={abierto} aria-controls="menu-productos"
        aria-label="Categorías de productos" onClick={() => setAbierto((a) => !a)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <ul className="hd-drop-list" id="menu-productos" hidden={!abierto}>
        {enlace("/productos", "Todos los productos", activa === "")}
        {categorias.map((c) => enlace(`/productos?categoria=${encodeURIComponent(c.filtro)}`, c.nombre, activa === norm(c.filtro)))}
      </ul>
    </div>
  );
}
