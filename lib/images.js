// Utilidades de imágenes de producto, compartidas por el Chat y el Dashboard.
// Soporta DOS formas de guardar fotos en Baserow (columna "Foto"):
//   1) Archivos subidos al campo tipo "File" de Baserow (array de objetos con url).
//   2) URLs en un campo de texto (Google Drive u otro enlace), varias separadas
//      por coma o salto de línea.
// Tras flattenRow(), un campo de archivos llega como texto "url1, url2"; esta
// función también acepta el array crudo por si se la llama antes de aplanar.

// Extrae el ID de archivo de un enlace de Google Drive.
export function driveId(url) {
  const m =
    url.match(/drive\.google\.com\/file\/d\/([^/]+)/) ||
    url.match(/drive\.google\.com\/open\?id=([^&]+)/) ||
    url.match(/[?&]id=([^&]+)/);
  return m ? m[1] : "";
}

// Convierte un enlace de Google Drive a una URL directa que sirve como <img src>.
export function driveDirect(url) {
  const id = driveId(url);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
}

// Posibles nombres de la columna de imágenes (por si cambia entre tablas).
const IMG_KEYS = [
  "Foto", "foto", "Fotos", "fotos",
  "Imagen", "imagen", "Imágenes", "Imagenes", "imagenes",
  "FotoURL", "Foto URL", "Foto Url",
];

// Devuelve un arreglo de URLs de imagen (sin duplicados) para una fila.
export function parseImages(row) {
  if (!row) return [];
  let raw = "";
  for (const k of IMG_KEYS) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") { raw = v; break; }
  }

  let urls = [];
  if (Array.isArray(raw)) {
    // Campo de archivos crudo de Baserow: [{ url, visible_name, ... }]
    urls = raw
      .map((v) => (v && typeof v === "object" ? (v.url || v.value || "") : v))
      .filter(Boolean);
  } else {
    // Texto: una o varias URLs separadas por coma o salto de línea.
    urls = String(raw).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  }

  const seen = new Set();
  const out = [];
  for (let u of urls) {
    if (u.includes("drive.google.com")) u = driveDirect(u);
    if (!seen.has(u)) { seen.add(u); out.push(u); }
  }
  return out;
}

// Posibles nombres de la columna de video.
const VIDEO_KEYS = ["Video", "video", "Videos", "videos", "VideoURL", "Video URL", "Video Url"];

// Devuelve los videos de una fila como objetos { kind, src }:
//   - kind "iframe": se incrusta con <iframe> (Google Drive, YouTube).
//   - kind "video":  archivo de video directo (.mp4, adjunto de Baserow) con <video>.
export function parseVideos(row) {
  if (!row) return [];
  let raw = "";
  for (const k of VIDEO_KEYS) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") { raw = v; break; }
  }

  let urls = [];
  if (Array.isArray(raw)) {
    urls = raw
      .map((v) => (v && typeof v === "object" ? (v.url || v.value || "") : v))
      .filter(Boolean);
  } else {
    urls = String(raw).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  }

  const seen = new Set();
  const out = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    if (u.includes("drive.google.com")) {
      const id = driveId(u);
      if (id) {
        out.push({
          kind: "iframe",
          src: `https://drive.google.com/file/d/${id}/preview`,
          thumb: `https://drive.google.com/thumbnail?id=${id}&sz=w512`,
        });
        continue;
      }
    }
    const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) {
      out.push({ kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}`, thumb: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` });
      continue;
    }
    out.push({ kind: "video", src: u, thumb: "" });
  }
  return out;
}
