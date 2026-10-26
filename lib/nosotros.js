// Página «Nosotros» (HU-33) guardada en `configuracion` (clave `nosotros`). Lectura pública de lo
// publicado y lectura/guardado del panel con la sesión (la RLS solo deja escribir al autenticado).
import { publicClient, userClient, supabaseConfigurado } from "./supabase";
import { borrarImagen, esImagenPropia } from "./cloudinary";
import { PLANTILLA, validarNosotros, fotosDe } from "./nosotros-base";

export * from "./nosotros-base";

// Lo publicado, o null (sin publicar, sin datos o Supabase caído). Nunca lanza.
export async function getNosotrosPublico() {
  if (!supabaseConfigurado()) return null;
  try {
    const { data, error } = await publicClient().from("configuracion").select("valor").eq("clave", "nosotros").maybeSingle();
    if (error || !data?.valor?.visible) return null;
    const v = validarNosotros(data.valor);
    return v.error ? null : v.nosotros;
  } catch {
    return null;
  }
}

// Para el editor: lo guardado o la plantilla sugerida (existe: false).
export async function leerNosotros(token) {
  const { data, error } = await userClient(token).from("configuracion").select("valor").eq("clave", "nosotros").maybeSingle();
  if (error) throw new Error("Supabase: " + error.message);
  return data?.valor ? { nosotros: data.valor, existe: true } : { nosotros: PLANTILLA, existe: false };
}

export async function guardarNosotros(token, datos) {
  const v = validarNosotros(datos, esImagenPropia);
  if (v.error) return v;
  const antes = await leerNosotros(token);
  const { error } = await userClient(token).from("configuracion").upsert([{ clave: "nosotros", valor: v.nosotros }], { onConflict: "clave" });
  if (error) throw new Error("Supabase: " + error.message);
  // Las fotos que se quitaron o cambiaron se borran de Cloudinary.
  const ahora = new Set(fotosDe(v.nosotros));
  for (const url of antes.existe ? fotosDe(antes.nosotros) : []) if (!ahora.has(url)) await borrarImagen(url);
  return { ok: true, nosotros: v.nosotros };
}
