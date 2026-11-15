// Botón «📷 Más fotos» (HU-36): enlace a la carpeta de Drive con las fotos reales del equipo.
// Solo se aceptan enlaces https de Google Drive / Google Fotos, para no abrir sitios ajenos desde
// la tienda. Lo usan el editor del producto, la carga CSV y lib/inventory.js al guardar.

const DOMINIOS = ["drive.google.com", "docs.google.com", "photos.google.com", "photos.app.goo.gl", "drive.app.goo.gl"];
export const MAX_MAS_FOTOS = 300;

// Devuelve { url } (vacío = sin botón) o { error } con un mensaje para el panel.
export function validarMasFotos(valor) {
  const v = String(valor ?? "").trim();
  if (!v) return { url: "" };
  if (v.length > MAX_MAS_FOTOS) return { error: `Más fotos: el enlace es muy largo (máximo ${MAX_MAS_FOTOS} caracteres).` };
  let u;
  try { u = new URL(v); } catch { return { error: "Más fotos: no es un enlace válido. Copia el enlace de la carpeta de Drive." }; }
  if (u.protocol !== "https:" || !DOMINIOS.includes(u.hostname)) {
    return { error: "Más fotos: solo se aceptan enlaces de Google Drive o Google Fotos (https://drive.google.com/…)." };
  }
  return { url: u.toString() };
}
