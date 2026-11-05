// Banners del Inicio (tabla `banners`, decisión 0009; HU-13). La imagen vive en Cloudinary
// (0007) y trae su propio diseño (texto y corte diagonal): aquí solo se guarda la URL, el enlace,
// el orden y si está activo. Sin banners con imagen se usan los de lib/site.js.
import { publicClient, userClient, supabaseConfigurado } from "./supabase";
import { SITE } from "./site";
import { cld } from "./cdn";
import { borrarImagen, esImagenPropia } from "./cloudinary";

export function bannerDesdeDb(b) {
  return {
    id: b.id,
    titulo: b.titulo || "",
    imagen: b.imagen_escritorio || "",
    imagenMovil: b.imagen_celular || "",
    alt: b.texto_alternativo || "",
    enlace: b.enlace || "",
    orden: b.orden,
    activo: b.activo,
  };
}

// Formato que usa el carrusel (HeroCarousel): { img, imgMovil, alt, href }.
export const paraCarrusel = (b) => ({
  img: cld(b.imagen, "f_auto,q_auto,w_1600"),
  imgMovil: b.imagenMovil ? cld(b.imagenMovil, "f_auto,q_auto,w_800") : "",
  alt: b.alt || b.titulo,
  href: b.enlace,
});

// Banners para la web: los activos y vigentes (lo filtra la RLS) que tienen imagen, en orden.
export async function getBannersPublicos() {
  if (!supabaseConfigurado()) return SITE.banners || [];
  try {
    const { data, error } = await publicClient().from("banners").select("*").order("orden").order("creado_en");
    if (error) throw error;
    const listos = data.map(bannerDesdeDb).filter((b) => b.imagen);
    return listos.length ? listos.map(paraCarrusel) : SITE.banners || [];
  } catch {
    return SITE.banners || [];
  }
}

// ---------- Panel ----------

function check({ data, error }) {
  if (error) throw new Error("Supabase: " + error.message);
  return data;
}

export async function listarBanners(token) {
  const data = check(await userClient(token).from("banners").select("*").order("orden").order("creado_en"));
  return data.map(bannerDesdeDb);
}

const texto = (v) => String(v ?? "").trim();

// Enlace válido: vacío, una ruta de la web («/productos?…»), una URL o «wa:<mensaje>».
function enlaceValido(e) {
  if (!e) return true;
  if (e.startsWith("/") || e.startsWith("wa:")) return e.length <= 500;
  try {
    return /^https?:$/.test(new URL(e).protocol);
  } catch {
    return false;
  }
}

// Valida los campos que llegan del panel y los traduce a columnas. Devuelve { error } o { fila }.
function validar(campos, parcial) {
  const fila = {};
  if (!parcial || "titulo" in campos) {
    fila.titulo = texto(campos.titulo);
    if (!fila.titulo) return { error: "Escribe un nombre para el banner (solo lo ves tú en el panel)." };
    if (fila.titulo.length > 120) return { error: "El nombre del banner es muy largo (máximo 120 caracteres)." };
  }
  if (!parcial || "alt" in campos) {
    fila.texto_alternativo = texto(campos.alt);
    if (fila.texto_alternativo.length > 200) return { error: "El texto alternativo es muy largo (máximo 200 caracteres)." };
  }
  if (!parcial || "enlace" in campos) {
    fila.enlace = texto(campos.enlace);
    if (!enlaceValido(fila.enlace)) return { error: "El enlace debe ser una ruta de la web (/productos?…), una URL con https:// o wa: seguido del mensaje." };
  }
  if (!parcial || "imagen" in campos) {
    fila.imagen_escritorio = texto(campos.imagen);
    if (!fila.imagen_escritorio) return { error: "Sube la imagen de escritorio (1600×500)." };
    if (!esImagenPropia(fila.imagen_escritorio)) return { error: "La imagen debe subirse desde el panel." };
  }
  if (!parcial || "imagenMovil" in campos) {
    fila.imagen_celular = texto(campos.imagenMovil) || null;
    if (fila.imagen_celular && !esImagenPropia(fila.imagen_celular)) return { error: "La imagen de celular debe subirse desde el panel." };
  }
  if ("activo" in campos) fila.activo = Boolean(campos.activo);
  return { fila };
}

export async function crearBanner(token, campos) {
  const v = validar(campos, false);
  if (v.error) return v;
  const actuales = await listarBanners(token);
  const orden = actuales.reduce((m, b) => Math.max(m, b.orden || 0), 0) + 1;
  const fila = check(await userClient(token).from("banners").insert({ ...v.fila, orden, activo: true }).select().single());
  return { banner: bannerDesdeDb(fila) };
}

export async function actualizarBanner(token, id, campos) {
  const v = validar(campos, true);
  if (v.error) return v;
  const antes = (await listarBanners(token)).find((b) => b.id === id);
  if (!antes) return { error: "El banner ya no existe. Recarga la página." };
  const fila = check(await userClient(token).from("banners").update(v.fila).eq("id", id).select().single());
  // Las imágenes reemplazadas o quitadas se borran de Cloudinary.
  if ("imagen_escritorio" in v.fila && antes.imagen !== v.fila.imagen_escritorio) await borrarImagen(antes.imagen);
  if ("imagen_celular" in v.fila && antes.imagenMovil && antes.imagenMovil !== v.fila.imagen_celular) await borrarImagen(antes.imagenMovil);
  return { banner: bannerDesdeDb(fila) };
}

// Guarda el orden completo: `ids` en el orden en que deben verse.
export async function reordenarBanners(token, ids) {
  const actuales = await listarBanners(token);
  if (!Array.isArray(ids) || ids.length !== actuales.length || !actuales.every((b) => ids.includes(b.id))) {
    return { error: "La lista cambió mientras ordenabas. Recarga la página." };
  }
  for (const [i, id] of ids.entries()) {
    check(await userClient(token).from("banners").update({ orden: i + 1 }).eq("id", id));
  }
  return { ok: true };
}

export async function quitarBanner(token, id) {
  const antes = (await listarBanners(token)).find((b) => b.id === id);
  check(await userClient(token).from("banners").delete().eq("id", id));
  if (antes) {
    await borrarImagen(antes.imagen);
    await borrarImagen(antes.imagenMovil);
  }
  return { ok: true };
}
