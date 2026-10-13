// Utilidades de presentación de productos, compartidas por el Inicio, Categorías y Productos.
import { SITE } from "./site";

export const f = (r, k) => (r?.[k] ?? "").toString().trim();
export const stockNum = (r) => parseInt(f(r, "Stock") || "0", 10) || 0;

export function precioNum(r) {
  const n = Number(f(r, "Precio").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
}

export function fmtPrecio(r) {
  const n = precioNum(r);
  return n && n > 0 ? `$${n.toLocaleString("es-CO")}` : "";
}

// Minúsculas y sin tildes, para comparar textos.
export function norm(s) {
  return (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function nombreProducto(r) {
  return [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ")
    || f(r, "Descripción").slice(0, 60) || f(r, "Código") || "Producto";
}

// Una categoría "coincide" con un filtro si su nombre lo contiene, sin tildes ni mayúsculas:
// el filtro "portatil" incluye "Portátil usado" y "Portátil nuevo".
export function enCategoria(r, filtro) {
  return !filtro || norm(f(r, "Categoría")).includes(norm(filtro));
}

export function imagenCategoria(nombre) {
  const n = norm(nombre);
  return (SITE.categoriaImagenes || []).find((c) => n.includes(norm(c.clave)))?.img || "";
}

// Categorías presentes en el inventario, con cuántos productos disponibles tiene cada una.
export function categoriasDe(rows) {
  const mapa = new Map();
  for (const r of rows) {
    const c = f(r, "Categoría");
    if (!c) continue;
    const prev = mapa.get(c) || { nombre: c, total: 0, disponibles: 0 };
    prev.total += 1;
    if (stockNum(r) > 0) prev.disponibles += 1;
    mapa.set(c, prev);
  }
  return [...mapa.values()]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map((c) => ({ ...c, img: imagenCategoria(c.nombre) }));
}
