// Páginas de políticas (tabla `paginas`, decisión 0011; HU-26). Cada una: slug, título, estilo
// («acordeon» o «texto»), orden, visible y secciones [{ titulo, texto }] en texto seguro.
import { publicClient, userClient, supabaseConfigurado } from "./supabase";

export * from "./paginas-base";
import { slugDe, validarPagina } from "./paginas-base";

// ---------- Web pública ----------

// Para la columna Soporte del pie: solo visibles, en orden. Nunca lanza.
export async function getPaginasSoporte() {
  if (!supabaseConfigurado()) return [];
  try {
    const { data, error } = await publicClient().from("paginas").select("slug,titulo").order("orden").order("titulo");
    return error ? [] : data || [];
  } catch {
    return [];
  }
}

// Una página visible por su slug, o null (oculta, inexistente o Supabase caído).
export async function getPaginaPublica(slug) {
  if (!supabaseConfigurado()) return null;
  try {
    const { data, error } = await publicClient().from("paginas").select("slug,titulo,estilo,secciones,actualizado_en").eq("slug", slugDe(slug)).maybeSingle();
    return error ? null : data;
  } catch {
    return null;
  }
}

// ---------- Panel (con el token de la sesión; la RLS solo deja escribir al autenticado) ----------

function check({ error, data }) {
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe otra página con esa dirección. Cambia la dirección.");
    throw new Error("Supabase: " + error.message);
  }
  return data;
}

export async function listarPaginas(token) {
  return check(await userClient(token).from("paginas").select("*").order("orden").order("titulo"));
}

export async function crearPagina(token, datos) {
  const v = validarPagina(datos);
  if (v.error) return v;
  const actuales = await listarPaginas(token);
  const orden = actuales.reduce((m, p) => Math.max(m, p.orden || 0), 0) + 1;
  return { pagina: check(await userClient(token).from("paginas").insert({ ...v.pagina, orden }).select().single()) };
}

export async function actualizarPagina(token, id, datos) {
  const v = validarPagina(datos);
  if (v.error) return v;
  return { pagina: check(await userClient(token).from("paginas").update(v.pagina).eq("id", id).select().single()) };
}

export async function borrarPagina(token, id) {
  check(await userClient(token).from("paginas").delete().eq("id", id));
  return { ok: true };
}

// Sube (-1) o baja (+1) una página en el orden, intercambiando con la vecina.
export async function moverPagina(token, id, dir) {
  const lista = await listarPaginas(token);
  const i = lista.findIndex((p) => p.id === id), j = i + (dir < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= lista.length) return { ok: true };
  const orden = lista.map((p, k) => ({ id: p.id, orden: k + 1 }));
  [orden[i].orden, orden[j].orden] = [orden[j].orden, orden[i].orden];
  for (const o of orden) check(await userClient(token).from("paginas").update({ orden: o.orden }).eq("id", o.id));
  return { ok: true };
}
