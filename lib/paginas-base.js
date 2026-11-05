// Partes puras de las páginas de políticas (HU-26): límites, direcciones, anclas y validación.
// Sin acceso a la base, para usarlas también en el navegador (editor del panel y vista previa).
import { norm } from "./productos";

export const MAX_SECCIONES = 40;
export const MAX_TITULO = 120;
export const MAX_TITULO_SECCION = 150;
export const MAX_TEXTO = 8000;
export const ESTILOS = ["acordeon", "texto"];

// «Política de envíos» -> «politica-de-envios». También da el ancla de cada sección.
export const slugDe = (t) => norm(t).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "");

// Anclas únicas por sección (#duracion-de-la-garantia, #duracion-de-la-garantia-2…).
export function anclas(secciones) {
  const vistos = new Map();
  return secciones.map((s, i) => {
    const base = slugDe(s.titulo) || `seccion-${i + 1}`;
    const n = (vistos.get(base) || 0) + 1;
    vistos.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

const texto = (v) => String(v ?? "").replace(/\r\n?/g, "\n").trim();

// Valida lo que llega del panel. Devuelve { pagina } o { error } con un mensaje para el dueño.
export function validarPagina(d = {}) {
  const titulo = texto(d.titulo).replace(/\s+/g, " ");
  const slug = slugDe(d.slug || titulo);
  if (!titulo) return { error: "Escribe el título de la página." };
  if (titulo.length > MAX_TITULO) return { error: `El título es muy largo (máximo ${MAX_TITULO} caracteres).` };
  if (!slug) return { error: "La dirección de la página no es válida: usa letras y números." };
  const estilo = ESTILOS.includes(d.estilo) ? d.estilo : "acordeon";
  if (!Array.isArray(d.secciones)) return { error: "Las secciones no tienen el formato esperado." };
  const secciones = [];
  for (const s of d.secciones) {
    const t = texto(s?.titulo).replace(/\s+/g, " "), x = texto(s?.texto);
    if (!t && !x) continue;
    const n = secciones.length + 1;
    if (!t) return { error: `La sección ${n} no tiene título.` };
    if (t.length > MAX_TITULO_SECCION) return { error: `El título de la sección ${n} es muy largo (máximo ${MAX_TITULO_SECCION}).` };
    if (x.length > MAX_TEXTO) return { error: `El texto de «${t}» es muy largo (máximo ${MAX_TEXTO} caracteres).` };
    secciones.push({ titulo: t, texto: x });
  }
  if (secciones.length > MAX_SECCIONES) return { error: `La página tiene ${secciones.length} secciones; el máximo es ${MAX_SECCIONES}.` };
  if (d.visible === true && !secciones.length) return { error: "Agrega al menos una sección antes de publicar la página." };
  return { pagina: { titulo, slug, estilo, visible: d.visible === true, secciones } };
}
