// Lectura de CSV (comillas, comas dentro de comillas, saltos de línea) y vista previa de la carga.
import { filaADb, textoEsOculto } from "./inventory";

// Convierte el texto en filas de celdas. Detecta coma o punto y coma por la primera línea.
export function parseCsv(texto) {
  const t = String(texto || "").replace(/^﻿/, "");
  const primera = t.split(/\r?\n/, 1)[0] || "";
  const sep = (primera.match(/;/g) || []).length > (primera.match(/,/g) || []).length ? ";" : ",";
  const filas = [];
  let fila = [], celda = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { celda += '"'; i++; }
      else if (c === '"') q = false;
      else celda += c;
    } else if (c === '"') q = true;
    else if (c === sep) { fila.push(celda); celda = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      fila.push(celda); celda = "";
      if (fila.some((x) => x.trim() !== "")) filas.push(fila);
      fila = [];
    } else celda += c;
  }
  fila.push(celda);
  if (fila.some((x) => x.trim() !== "")) filas.push(fila);
  return filas;
}

const COLUMNAS = ["Código", "Categoría", "Descripción", "Marca", "Modelo", "Procesador", "Generación",
  "RAM", "Almacenamiento", "Estado", "Precio", "Stock", "Foto", "Video", "Oculto"];
const sinTilde = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const ENTERO = /^\s*\d[\d.,\s$]*$/;

// Valida y clasifica cada fila contra los códigos que ya existen.
// Devuelve { nuevos, modificados, errores, filas } donde filas son las que se pueden aplicar.
export function analizarCsv(texto, existentes) {
  const datos = parseCsv(texto);
  if (datos.length < 2) return { error: "El archivo no tiene filas de productos." };
  const mapa = new Map(COLUMNAS.map((c) => [sinTilde(c), c]));
  const cols = datos[0].map((h) => mapa.get(sinTilde(h)) || null);
  if (!cols.includes("Código")) return { error: "Falta la columna «Código»." };

  const vistos = new Set();
  const nuevos = [], modificados = [], errores = [];
  datos.slice(1).forEach((celdas, i) => {
    const n = i + 2; // número de fila en la hoja
    const campos = {};
    cols.forEach((c, j) => { if (c) campos[c] = (celdas[j] ?? "").trim(); });
    const codigo = campos["Código"];
    const falla = (motivo) => errores.push({ fila: n, codigo: codigo || "", motivo });
    if (!codigo) return falla("Falta el Código.");
    if (vistos.has(codigo)) return falla("Código repetido en el archivo.");
    vistos.add(codigo);
    for (const k of ["Precio", "Stock"]) {
      if (campos[k] && !ENTERO.test(campos[k])) return falla(`${k} no es un número («${campos[k]}»).`);
    }
    const dato = filaADb(campos);
    // «Oculto» vacío en el archivo no debe reactivar un producto ya oculto.
    if (!campos["Oculto"] && "Oculto" in campos) delete dato.activo;
    const previo = existentes.get(codigo);
    if (previo) modificados.push({ fila: n, codigo, id: previo, dato });
    else nuevos.push({ fila: n, codigo, dato: { activo: !textoEsOculto(campos["Oculto"]), ...dato } });
  });
  return { nuevos, modificados, errores, total: datos.length - 1 };
}
