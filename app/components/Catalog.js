"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { parseImages } from "../../lib/images";

const f = (r, k) => (r?.[k] ?? "").toString().trim();
const stockNum = (r) => parseInt(f(r, "Stock") || "0", 10) || 0;

function precioNum(r) {
  const n = Number(f(r, "Precio").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
}
function fmtPrecio(r) {
  const n = precioNum(r);
  return n && n > 0 ? `$${n.toLocaleString("es-CO")}` : "";
}
function norm(s) {
  return (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function ProductCard({ r }) {
  const sold = stockNum(r) <= 0;
  const foto = parseImages(r)[0] || "";
  const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ")
    || f(r, "Descripción").slice(0, 60) || f(r, "Código") || "Producto";
  const specs = [
    f(r, "Procesador"),
    f(r, "Generación") && `${f(r, "Generación")}ª Gen`,
    f(r, "RAM"),
    f(r, "Almacenamiento"),
  ].filter(Boolean).join(" · ");
  const precio = fmtPrecio(r);

  return (
    <Link className={`card${sold ? " sold" : ""}`} href={`/producto/${encodeURIComponent(f(r, "Código"))}`}>
      {sold && <span className="ribbon">AGOTADO</span>}
      <div className="card-img">
        {foto
          ? <img src={foto} alt={nombre} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          : <span className="noimg">💻</span>}
      </div>
      <div className="card-body">
        <span className="card-cat">{f(r, "Categoría") || "Producto"}{f(r, "Estado") ? ` · ${f(r, "Estado")}` : ""}</span>
        <span className="card-title">{nombre}</span>
        {specs && <span className="card-specs">{specs}</span>}
        <div className="card-bottom">
          {precio
            ? <span className="card-price">{precio}</span>
            : <span className="card-price tbd">Precio: consultar</span>}
          {sold
            ? <span className="badge bad">Agotado</span>
            : <span className="badge ok">Disponible</span>}
        </div>
        <span className="card-code">Ref: {f(r, "Código")}</span>
      </div>
    </Link>
  );
}

export default function Catalog({ rows = [], demo = false }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [marca, setMarca] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloDisp, setSoloDisp] = useState(false);

  const categorias = useMemo(() => {
    const set = new Set(rows.map((r) => f(r, "Categoría")).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [rows]);

  const marcas = useMemo(() => {
    const base = cat ? rows.filter((r) => f(r, "Categoría") === cat) : rows;
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
      if (cat && f(r, "Categoría") !== cat) return false;
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
      <h2 className="section-title">Nuestro catálogo</h2>
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
