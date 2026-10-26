"use client";

import { Fragment, useEffect, useRef } from "react";
import { FACETAS, opcionesDe, opcionesTipo, conteoTactil, activos, rangoMal, pesos, VACIOS } from "../../lib/filtros-catalogo";

// Panel vertical de filtros del catálogo (HU-28). Trabaja sobre un borrador: nada cambia en el
// listado hasta pulsar «Aplicar». En celular es una hoja a pantalla completa que abre el botón
// «Filtros» del listado.
export default function FiltrosCatalogo({ rows, borrador, setBorrador, categorias, mostrarPrecios, coinciden, onAplicar, onLimpiar, abierto, onCerrar }) {
  const caja = useRef(null);
  const set = (k, v) => setBorrador((b) => ({ ...b, [k]: v }));
  const mal = rangoMal(borrador);
  const n = activos(borrador);
  const tactil = conteoTactil(rows, borrador);

  // Celular: foco al abrir y Escape para cerrar.
  useEffect(() => {
    if (!abierto) return;
    caja.current?.querySelector("select, input, button")?.focus();
    const esc = (e) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [abierto]);

  const lista = (id, nombre, valor, ops, onChange) => (
    <div className="fc-campo">
      <label htmlFor={id}>{nombre}</label>
      <select id={id} className="filter-sel" value={valor} onChange={(e) => onChange(e.target.value)} disabled={!ops.length}>
        <option value="">{ops.length ? "Todos" : "Sin opciones"}</option>
        {ops.map((o) => <option key={o.valor} value={o.valor} disabled={o.n === 0 && o.valor !== valor}>{o.etiqueta} ({o.n})</option>)}
      </select>
    </div>
  );

  return (
    <aside className={`fc${abierto ? " abierto" : ""}`} id="filtros-catalogo" ref={caja} aria-label="Filtros de productos"
      role={abierto ? "dialog" : undefined} aria-modal={abierto || undefined}>
      <form onSubmit={(e) => { e.preventDefault(); if (!mal) onAplicar(); }}>
        <div className="fc-head">
          <h2>Filtros{n > 0 && <span className="fc-n" aria-label={`${n} activos`}>{n}</span>}</h2>
          <button type="button" className="fc-cerrar" onClick={onCerrar} aria-label="Cerrar filtros">✕</button>
        </div>

        {categorias.length > 0 && lista("fc-tipo", "Tipo", borrador.categoria, opcionesTipo(rows, borrador, categorias), (v) => set("categoria", v))}
        {FACETAS.map((fa) => <Fragment key={fa.param}>{lista(`fc-${fa.param}`, fa.nombre, borrador[fa.param], opcionesDe(rows, borrador, fa), (v) => set(fa.param, v))}</Fragment>)}

        {mostrarPrecios && (
          <fieldset className="fc-campo fc-precio">
            <legend>Precio</legend>
            <div className="fc-rango">
              <label className="sr-only" htmlFor="fc-min">Precio mínimo</label>
              <input id="fc-min" className="filter-num" inputMode="numeric" placeholder="Mínimo" value={borrador.min}
                onChange={(e) => set("min", e.target.value.replace(/\D/g, ""))} />
              <span aria-hidden="true">–</span>
              <label className="sr-only" htmlFor="fc-max">Precio máximo</label>
              <input id="fc-max" className="filter-num" inputMode="numeric" placeholder="Máximo" value={borrador.max}
                onChange={(e) => set("max", e.target.value.replace(/\D/g, ""))} />
            </div>
            {mal
              ? <small className="fc-aviso" role="alert">El precio mínimo es mayor que el máximo. Corrígelo para aplicar.</small>
              : (borrador.min || borrador.max) && <small className="fc-ayuda">{pesos(borrador.min) ? `Desde $${pesos(borrador.min).toLocaleString("es-CO")}` : "Sin mínimo"} · {pesos(borrador.max) ? `hasta $${pesos(borrador.max).toLocaleString("es-CO")}` : "sin máximo"}</small>}
          </fieldset>
        )}

        <fieldset className="fc-campo fc-tactil">
          <legend>Táctil</legend>
          <div className="fc-seg">
            {[["", "Todos", tactil.si + tactil.no], ["si", "Sí", tactil.si], ["no", "No", tactil.no]].map(([v, et, c]) => (
              <label key={v || "todos"} className={borrador.tactil === v ? "on" : ""}>
                <input type="radio" name="fc-tactil" value={v} checked={borrador.tactil === v} onChange={() => set("tactil", v)} />
                {et} <small>({c})</small>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="filter-check fc-disp">
          <input type="checkbox" checked={borrador.disp === "1"} onChange={(e) => set("disp", e.target.checked ? "1" : "")} />
          <span>Solo disponibles</span>
        </label>

        <div className="fc-acciones">
          <button type="submit" className="fc-aplicar" disabled={mal}>Aplicar{!mal && <> · {coinciden} {coinciden === 1 ? "producto" : "productos"}</>}</button>
          <button type="button" className="fc-limpiar" onClick={() => { setBorrador(VACIOS); onLimpiar(); }} disabled={n === 0}>Limpiar</button>
        </div>
      </form>
    </aside>
  );
}
