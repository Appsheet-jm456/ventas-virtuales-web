"use client";

// Filtros por características del listado de productos (HU-19). Son dinámicos: las opciones
// salen de los productos cargados y cada lista solo ofrece lo que aún tiene resultados con los
// demás filtros. «8GB» y «8 GB» cuentan como el mismo valor.

export const FACETAS = [
  { key: "Modelo", nombre: "Modelo" },
  { key: "RAM", nombre: "RAM" },
  { key: "Procesador", nombre: "Procesador" },
  { key: "Generación", nombre: "Generación" },
];

export const FILTROS_VACIOS = { Modelo: "", RAM: "", Procesador: "", "Generación": "", min: "", max: "" };

const txt = (r, k) => (r?.[k] ?? "").toString().trim();
// Clave de comparación: sin tildes, sin mayúsculas y sin espacios.
const clave = (v) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "");
const pesos = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d ? Number(d) : null;
};

// ¿Cumple la fila los filtros? `excepto` deja fuera una faceta (para calcular sus opciones).
export function cumpleFiltros(r, fl, excepto) {
  for (const { key } of FACETAS) {
    if (key !== excepto && fl[key] && clave(txt(r, key)) !== fl[key]) return false;
  }
  const min = pesos(fl.min), max = pesos(fl.max);
  if (min !== null || max !== null) {
    const p = pesos(txt(r, "Precio"));
    if (p === null) return false;
    if (min !== null && p < min) return false;
    if (max !== null && p > max) return false;
  }
  return true;
}

// Opciones de una faceta con su conteo, según los demás filtros. El valor elegido siempre
// aparece, aunque ya no tenga resultados, para poder quitarlo.
export function opcionesDe(rows, fl, key) {
  const mapa = new Map();
  for (const r of rows) {
    const v = txt(r, key);
    if (!v || !cumpleFiltros(r, fl, key)) continue;
    const k = clave(v);
    const o = mapa.get(k) || { clave: k, etiqueta: v, n: 0 };
    o.n += 1;
    mapa.set(k, o);
  }
  if (fl[key] && !mapa.has(fl[key])) mapa.set(fl[key], { clave: fl[key], etiqueta: fl[key], n: 0 });
  return [...mapa.values()].sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es", { numeric: true }));
}

export const filtrosActivos = (fl) => Object.values(fl).filter(Boolean).length;

export default function FiltrosProductos({ rows, fl, onChange }) {
  const set = (k, v) => onChange({ ...fl, [k]: v });
  const min = pesos(fl.min), max = pesos(fl.max);
  const rangoMal = min !== null && max !== null && min > max;
  const activos = filtrosActivos(fl);

  return (
    <div className="pf-filtros">
      <div className="pff-head">
        <h3>Filtros{activos ? <span className="pr-n">{activos}</span> : null}</h3>
        {activos > 0 && <button type="button" className="pr-link" onClick={() => onChange(FILTROS_VACIOS)}>Limpiar filtros</button>}
      </div>
      {FACETAS.map(({ key, nombre }) => {
        const ops = opcionesDe(rows, fl, key);
        return (
          <div key={key} className="field">
            <label htmlFor={`fil-${key}`}>{nombre}</label>
            <select id={`fil-${key}`} className="input" value={fl[key]} onChange={(e) => set(key, e.target.value)} disabled={!ops.length}>
              <option value="">{ops.length ? "Todos" : "Sin datos"}</option>
              {ops.map((o) => <option key={o.clave} value={o.clave}>{o.etiqueta} ({o.n})</option>)}
            </select>
          </div>
        );
      })}
      <div className="field">
        <span className="pff-label">Precio</span>
        <div className="pff-rango">
          <input className="input" inputMode="numeric" placeholder="Mínimo" aria-label="Precio mínimo" value={fl.min} onChange={(e) => set("min", e.target.value.replace(/\D/g, ""))} />
          <span aria-hidden="true">–</span>
          <input className="input" inputMode="numeric" placeholder="Máximo" aria-label="Precio máximo" value={fl.max} onChange={(e) => set("max", e.target.value.replace(/\D/g, ""))} />
        </div>
        {rangoMal
          ? <small className="ct-hint warn" role="alert">El mínimo es mayor que el máximo: ningún producto puede cumplirlo.</small>
          : (min !== null || max !== null) && <small className="ct-hint">{min !== null ? `Desde $${min.toLocaleString("es-CO")}` : "Sin mínimo"} · {max !== null ? `hasta $${max.toLocaleString("es-CO")}` : "sin máximo"}</small>}
      </div>
    </div>
  );
}
