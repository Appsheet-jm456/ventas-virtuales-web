// Filtros dinámicos del catálogo público (HU-28). Misma idea que los del panel (HU-19): las
// opciones salen de los productos publicados, cada lista solo ofrece lo que aún tiene resultados
// con los demás filtros y «8GB» = «8 GB». Se calculan en el navegador, sin consultas nuevas.
// Los filtros viven en la dirección (/productos?marca=hp&tactil=si…) para poder compartirlos.
import { enCategoria, norm } from "./productos";

// Facetas de lista: clave del parámetro en la dirección y columna del producto.
export const FACETAS = [
  { param: "marca", col: "Marca", nombre: "Marca" },
  { param: "modelo", col: "Modelo", nombre: "Modelo" },
  { param: "procesador", col: "Procesador", nombre: "Procesador" },
];
export const PARAMS = ["categoria", ...FACETAS.map((x) => x.param), "min", "max", "tactil", "disp"];
export const VACIOS = Object.fromEntries(PARAMS.map((p) => [p, ""]));

const txt = (r, k) => (r?.[k] ?? "").toString().trim();
// Clave de comparación: sin tildes, sin mayúsculas y sin espacios.
export const clave = (v) => norm(v).replace(/\s+/g, "");
export const pesos = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d ? Number(d) : null;
};
const esTactil = (r) => txt(r, "Táctil") !== "";
const stock = (r) => parseInt(txt(r, "Stock") || "0", 10) || 0;

// Lee los filtros de la dirección (URLSearchParams).
export function desdeDireccion(sp) {
  const o = { ...VACIOS };
  for (const p of PARAMS) o[p] = (sp.get(p) || "").trim();
  if (!["si", "no"].includes(o.tactil)) o.tactil = "";
  if (o.disp !== "1") o.disp = "";
  o.min = o.min.replace(/\D/g, "");
  o.max = o.max.replace(/\D/g, "");
  return o;
}

// Filtros -> «?marca=hp&…» conservando lo demás de la dirección (p. ej. ?q=).
export function aDireccion(fl, spActual) {
  const p = new URLSearchParams(spActual?.toString() || "");
  for (const k of PARAMS) { if (fl[k]) p.set(k, fl[k]); else p.delete(k); }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

// ¿Cumple la fila los filtros? `excepto` deja fuera un filtro (para calcular sus opciones).
export function cumple(r, fl, excepto) {
  if (excepto !== "categoria" && fl.categoria && !enCategoria(r, fl.categoria)) return false;
  for (const { param, col } of FACETAS) {
    if (param !== excepto && fl[param] && clave(txt(r, col)) !== fl[param]) return false;
  }
  if (excepto !== "tactil" && fl.tactil && esTactil(r) !== (fl.tactil === "si")) return false;
  if (fl.disp && stock(r) <= 0) return false;
  const min = pesos(fl.min), max = pesos(fl.max);
  if (min !== null || max !== null) {
    const p = pesos(txt(r, "Precio"));
    if (p === null || p <= 0) return false;
    if (min !== null && p < min) return false;
    if (max !== null && p > max) return false;
  }
  return true;
}

// Opciones de una faceta con conteo. La elegida siempre aparece (aunque quede en 0) para poder quitarla.
export function opcionesDe(rows, fl, { param, col }) {
  const mapa = new Map();
  for (const r of rows) {
    const v = txt(r, col);
    if (!v || !cumple(r, fl, param)) continue;
    const k = clave(v);
    const o = mapa.get(k) || { valor: k, etiqueta: v, n: 0 };
    o.n += 1;
    mapa.set(k, o);
  }
  if (fl[param] && !mapa.has(fl[param])) mapa.set(fl[param], { valor: fl[param], etiqueta: fl[param], n: 0 });
  return [...mapa.values()].sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es", { numeric: true }));
}

// Tipo = categorías de /admin/categorias (se comparan «contiene», como el menú de HU-25).
export function opcionesTipo(rows, fl, categorias) {
  const ops = categorias.map((c) => ({
    valor: c.filtro, etiqueta: c.nombre,
    n: rows.filter((r) => enCategoria(r, c.filtro) && cumple(r, fl, "categoria")).length,
  }));
  if (fl.categoria && !ops.some((o) => norm(o.valor) === norm(fl.categoria))) ops.push({ valor: fl.categoria, etiqueta: fl.categoria, n: 0 });
  return ops;
}

export function conteoTactil(rows, fl) {
  let si = 0, no = 0;
  for (const r of rows) if (cumple(r, fl, "tactil")) (esTactil(r) ? si++ : no++);
  return { si, no };
}

export const activos = (fl) => PARAMS.filter((p) => p !== "max" && (p === "min" ? fl.min || fl.max : fl[p])).length;
export const rangoMal = (fl) => { const a = pesos(fl.min), b = pesos(fl.max); return a !== null && b !== null && a > b; };
