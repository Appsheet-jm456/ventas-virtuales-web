"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { f, stockNum, precioNum, norm, enCategoria } from "../../lib/productos";

// Catálogo con buscador y filtros (HU-06). La búsqueda y la categoría pueden venir en la URL:
// /productos?q=thinkpad o /productos?categoria=portatil (la categoría se compara "contiene").
export default function Catalog({ rows = [], demo = false }) {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [cat, setCat] = useState(sp.get("categoria") || "");

  // El buscador del encabezado navega a /productos?q=…; si ya estamos aquí, se aplica igual.
  useEffect(() => {
    setQ(sp.get("q") || "");
    setCat(sp.get("categoria") || "");
  }, [sp]);
  const [marca, setMarca] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloDisp, setSoloDisp] = useState(false);

  const categorias = useMemo(() => {
    const set = new Set(rows.map((r) => f(r, "Categoría")).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [rows]);

  const marcas = useMemo(() => {
    const base = rows.filter((r) => enCategoria(r, cat));
    const set = new Set(base.map((r) => f(r, "Marca")).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [rows, cat]);

  useEffect(() => {
    if (marca && !marcas.includes(marca)) setMarca("");
  }, [marcas, marca]);

  const filtered = useMemo(() => {
    const nq = norm(q);
    const min = precioMin ? Number(precioMin) : null;
    const max = precioMax ? Number(precioMax) : null;
    return rows.filter((r) => {
      if (soloDisp && stockNum(r) <= 0) return false;
      if (!enCategoria(r, cat)) return false;
      if (marca && f(r, "Marca") !== marca) return false;
      if (min != null || max != null) {
        const p = precioNum(r);
        if (p == null) return false;
        if (min != null && p < min) return false;
        if (max != null && p > max) return false;
      }
      if (nq) {
        const hay = norm([
          f(r, "Código"), f(r, "Marca"), f(r, "Modelo"),
          f(r, "Procesador"), f(r, "Categoría"), f(r, "Descripción"),
        ].join(" "));
        if (!hay.includes(nq)) return false;
      }
      return true;
    });
  }, [rows, q, cat, marca, precioMin, precioMax, soloDisp]);

  const hayFiltros = q || cat || marca || precioMin || precioMax || soloDisp;

  return (
    <section className="catalog wrap" id="catalogo">
      <h1 className="section-title">Productos</h1>
      <p className="section-sub">Equipos corporativos con garantía. Precios e inventario sujetos a cambios.</p>

      {demo && (
        <div className="demo-note">
          Modo demo: mostrando productos de ejemplo. Configura Baserow para ver el inventario real.
        </div>
      )}

      {categorias.length > 1 && (
        <div className="cat-chips">
          <button className={`cat-chip${cat === "" ? " active" : ""}`} onClick={() => setCat("")}>Todos</button>
          {categorias.map((c) => (
            <button key={c} className={`cat-chip${cat === c ? " active" : ""}`} onClick={() => setCat(cat === c ? "" : c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="filters">
        <input
          className="filter-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar marca, modelo, procesador, referencia…"
        />
        <select className="filter-sel" value={marca} onChange={(e) => setMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="filter-num" type="number" inputMode="numeric" value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)} placeholder="Precio mín" />
        <input className="filter-num" type="number" inputMode="numeric" value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)} placeholder="Precio máx" />
        <label className="filter-check">
          <input type="checkbox" checked={soloDisp} onChange={(e) => setSoloDisp(e.target.checked)} />
          <span>Solo disponibles</span>
        </label>
        <span className="filter-count">{filtered.length} de {rows.length}</span>
        {hayFiltros && (
          <button className="filter-clear" onClick={() => { setQ(""); setCat(""); setMarca(""); setPrecioMin(""); setPrecioMax(""); setSoloDisp(false); }}>
            Limpiar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-msg">No encontramos productos con esos filtros. Escríbenos por WhatsApp y te ayudamos a conseguirlo.</div>
      ) : (
        <div className="grid">
          {filtered.map((r, i) => <ProductCard key={f(r, "Código") + "-" + i} r={r} />)}
        </div>
      )}
    </section>
  );
}
