"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import FiltrosCatalogo from "./FiltrosCatalogo";
import { f, norm } from "../../lib/productos";
import { desdeDireccion, aDireccion, cumple, activos, VACIOS } from "../../lib/filtros-catalogo";

// Catálogo con buscador y filtros (HU-06, HU-28). Los filtros del panel izquierdo se eligen en un
// borrador y se aplican con el botón «Aplicar»; quedan en la dirección para compartirlos
// (/productos?categoria=portatil&marca=hp&tactil=si…). La búsqueda (?q=) filtra al escribir.
// `categoriasAdmin` son las de /admin/categorias (HU-25): el Tipo del panel y el menú desplegable
// usan la misma palabra.
export default function Catalog({ rows = [], demo = false, categoriasAdmin = [], mostrarPrecios = true, waHref = "" }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(sp.get("q") || "");
  const aplicado = useMemo(() => {
    const fl = desdeDireccion(sp);
    if (!mostrarPrecios) { fl.min = ""; fl.max = ""; }
    return fl;
  }, [sp, mostrarPrecios]);
  const [borrador, setBorrador] = useState(aplicado);
  const [abierto, setAbierto] = useState(false);

  // El buscador del encabezado y el menú de categorías navegan aquí: se toman de la dirección.
  useEffect(() => { setQ(sp.get("q") || ""); setBorrador(aplicado); }, [sp, aplicado]);

  const categorias = useMemo(() => {
    if (categoriasAdmin.length) return categoriasAdmin;
    const set = new Set(rows.map((r) => f(r, "Categoría")).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "es")).map((c) => ({ nombre: c, filtro: c }));
  }, [rows, categoriasAdmin]);

  // La búsqueda acota la base sobre la que se calculan opciones y conteos.
  const base = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return rows;
    return rows.filter((r) => norm([f(r, "Código"), f(r, "Marca"), f(r, "Modelo"), f(r, "Procesador"), f(r, "Categoría"), f(r, "Descripción")].join(" ")).includes(nq));
  }, [rows, q]);
  const filtrados = useMemo(() => base.filter((r) => cumple(r, aplicado)), [base, aplicado]);
  const coinciden = useMemo(() => base.filter((r) => cumple(r, borrador)).length, [base, borrador]);

  const ir = (fl) => router.replace(`/productos${aDireccion(fl, sp)}`, { scroll: false });
  function aplicar() { ir(borrador); setAbierto(false); }
  function limpiar() { ir(VACIOS); setAbierto(false); }
  function cerrar() { setAbierto(false); setBorrador(aplicado); }

  const catActiva = categorias.find((c) => norm(c.filtro) === norm(aplicado.categoria));
  const nActivos = activos(aplicado);

  return (
    <section className="catalog wrap" id="catalogo">
      <h1 className="section-title">{catActiva ? catActiva.nombre : "Productos"}</h1>
      <p className="section-sub">Equipos corporativos con garantía. Precios e inventario sujetos a cambios.</p>

      {demo && (
        <div className="demo-note">
          Modo demo: mostrando productos de ejemplo. Configura Baserow para ver el inventario real.
        </div>
      )}

      <div className="cat-layout">
        <FiltrosCatalogo rows={base} borrador={borrador} setBorrador={setBorrador} categorias={categorias}
          mostrarPrecios={mostrarPrecios} coinciden={coinciden} onAplicar={aplicar} onLimpiar={limpiar}
          abierto={abierto} onCerrar={cerrar} />
        {abierto && <div className="fc-fondo" onClick={cerrar} aria-hidden="true" />}

        <div className="cat-main">
          <div className="filters">
            <input className="filter-search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar marca, modelo, procesador, referencia…" aria-label="Buscar en el catálogo" />
            <button type="button" className="fc-abrir" onClick={() => setAbierto(true)} aria-expanded={abierto} aria-controls="filtros-catalogo">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
              Filtros{nActivos > 0 && <span className="fc-n">{nActivos}</span>}
            </button>
            <span className="filter-count" role="status">{filtrados.length} {filtrados.length === 1 ? "producto" : "productos"}</span>
          </div>

          {filtrados.length === 0 ? (
            <div className="empty-msg fc-vacio">
              <p><b>No encontramos equipos con esos filtros.</b></p>
              <p>Prueba quitando alguno o escríbenos y te ayudamos a conseguirlo.</p>
              <div className="fc-vacio-acc">
                {(nActivos > 0 || q) && <button type="button" className="fc-limpiar" onClick={() => { setQ(""); limpiar(); }}>Limpiar filtros</button>}
                {waHref && <a className="btn-wa" href={waHref} target="_blank" rel="noopener noreferrer">💬 Escríbenos por WhatsApp</a>}
              </div>
            </div>
          ) : (
            <div className="grid">
              {filtrados.map((r, i) => <ProductCard key={f(r, "Código") + "-" + i} r={r} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
