// Configuración de la tienda (tabla `configuracion`, decisión 0009; HU-15). Cada clave guarda un
// objeto JSON: `empresa` (datos y contacto) y `catalogo` (reglas de cómo se ve el inventario).
// `lib/site.js` queda como respaldo: modo demo, tabla vacía o Supabase caído.
import { publicClient, userClient, supabaseConfigurado } from "./supabase";
import { SITE } from "./site";

export const MENSAJE_PRODUCTO =
  "Hola 👋, estoy interesado en el *{producto}* (código {codigo}) que vi en su página web. ¿Está disponible?";

// Valores de respaldo con las claves de la base (las mismas del seed de la migración).
export const EMPRESA_BASE = {
  nombre: SITE.nombre,
  lema: SITE.lema,
  ciudad: SITE.ciudad,
  direccion: SITE.direccion,
  whatsapp: SITE.whatsapp,
  whatsapp_visible: SITE.whatsappDisplay,
  instagram: SITE.instagram,
  facebook: SITE.facebook,
  tiktok: SITE.tiktok,
  horario: SITE.horario || "",
  mensaje_producto: MENSAJE_PRODUCTO,
};
export const CATALOGO_BASE = { mostrar_agotados: true, mostrar_precios: true };

async function leerClaves(cliente) {
  const { data, error } = await cliente.from("configuracion").select("clave,valor").in("clave", ["empresa", "catalogo"]);
  if (error) throw new Error("Supabase: " + error.message);
  const mapa = Object.fromEntries((data || []).map((r) => [r.clave, r.valor || {}]));
  return {
    empresa: { ...EMPRESA_BASE, ...limpiar(mapa.empresa) },
    catalogo: { ...CATALOGO_BASE, ...(mapa.catalogo || {}) },
  };
}

// Un texto vacío guardado no pisa el respaldo, salvo en los campos que pueden ir vacíos a propósito.
const PUEDEN_IR_VACIOS = ["horario", "instagram", "facebook", "tiktok"];
function limpiar(valor = {}) {
  const o = {};
  for (const [k, v] of Object.entries(valor)) {
    if (typeof v === "string" && v.trim() === "" && !PUEDEN_IR_VACIOS.includes(k)) continue;
    o[k] = v;
  }
  return o;
}

// Configuración efectiva para la web pública. Nunca lanza: ante cualquier fallo usa el respaldo.
export async function getConfig() {
  if (!supabaseConfigurado()) return { empresa: { ...EMPRESA_BASE }, catalogo: { ...CATALOGO_BASE } };
  try {
    return await leerClaves(publicClient());
  } catch {
    return { empresa: { ...EMPRESA_BASE }, catalogo: { ...CATALOGO_BASE } };
  }
}

// Objeto con la forma de SITE (nombre, lema, whatsappDisplay…) con los datos configurados encima.
export async function getSite() {
  const { empresa, catalogo } = await getConfig();
  return {
    ...SITE,
    nombre: empresa.nombre,
    lema: empresa.lema,
    ciudad: empresa.ciudad,
    direccion: empresa.direccion,
    whatsapp: String(empresa.whatsapp).replace(/\D/g, "") || SITE.whatsapp,
    whatsappDisplay: empresa.whatsapp_visible || empresa.whatsapp,
    instagram: empresa.instagram,
    facebook: empresa.facebook,
    tiktok: empresa.tiktok,
    horario: empresa.horario,
    mensajeProducto: empresa.mensaje_producto || MENSAJE_PRODUCTO,
    catalogo,
  };
}

// «Hola, {producto} (código {codigo})» -> texto final.
export const mensajeProducto = (plantilla, producto, codigo) =>
  String(plantilla || MENSAJE_PRODUCTO).replaceAll("{producto}", producto).replaceAll("{codigo}", codigo);

// ---------- Panel ----------

export async function leerConfiguracion(token) {
  return leerClaves(userClient(token));
}

const texto = (v) => String(v ?? "").trim();
const url = (v) => {
  const t = texto(v);
  if (!t) return "";
  try {
    const u = new URL(t);
    return /^https?:$/.test(u.protocol) ? t : null;
  } catch {
    return null;
  }
};

// Valida lo que llega del formulario. Devuelve { error } o { empresa, catalogo } ya limpios.
export function validarConfiguracion({ empresa = {}, catalogo = {} }) {
  const e = {
    nombre: texto(empresa.nombre),
    lema: texto(empresa.lema),
    ciudad: texto(empresa.ciudad),
    direccion: texto(empresa.direccion),
    whatsapp: texto(empresa.whatsapp).replace(/[\s+().-]/g, ""),
    whatsapp_visible: texto(empresa.whatsapp_visible),
    horario: texto(empresa.horario),
    mensaje_producto: texto(empresa.mensaje_producto),
  };
  if (!e.nombre) return { error: "Escribe el nombre comercial." };
  if (e.nombre.length > 80) return { error: "El nombre comercial es muy largo (máximo 80 caracteres)." };
  if (e.lema.length > 200) return { error: "El lema es muy largo (máximo 200 caracteres)." };
  if (e.direccion.length > 300) return { error: "La dirección es muy larga (máximo 300 caracteres)." };
  if (e.horario.length > 200) return { error: "El horario es muy largo (máximo 200 caracteres)." };
  if (!/^\d{10,15}$/.test(e.whatsapp)) {
    return { error: "El WhatsApp debe llevar solo números, con indicativo y sin espacios. Ejemplo: 573175591252." };
  }
  if (!e.whatsapp_visible) e.whatsapp_visible = e.whatsapp;
  if (!e.mensaje_producto) return { error: "Escribe el mensaje de WhatsApp para los productos." };
  if (e.mensaje_producto.length > 500) return { error: "El mensaje de WhatsApp es muy largo (máximo 500 caracteres)." };
  for (const [clave, nombre] of [["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"]]) {
    const u = url(empresa[clave]);
    if (u === null) return { error: `El enlace de ${nombre} debe empezar por https:// (o déjalo vacío para ocultarlo).` };
    e[clave] = u;
  }
  return {
    empresa: e,
    catalogo: { mostrar_agotados: catalogo.mostrar_agotados !== false, mostrar_precios: catalogo.mostrar_precios !== false },
  };
}

export async function guardarConfiguracion(token, datos) {
  const v = validarConfiguracion(datos);
  if (v.error) return v;
  const { error } = await userClient(token)
    .from("configuracion")
    .upsert([{ clave: "empresa", valor: v.empresa }, { clave: "catalogo", valor: v.catalogo }], { onConflict: "clave" });
  if (error) throw new Error("Supabase: " + error.message);
  return { ok: true, ...v };
}
