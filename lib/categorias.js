// Categorías de la tienda (tabla `categorias`, decisión 0009; HU-14). Una categoría agrupa los
// productos cuya columna Categoría contiene su palabra (`coincide_con`), sin tildes ni
// mayúsculas: «portatil» agrupa «Portátil usado» y «Portátil nuevo».
import { publicClient, userClient, supabaseConfigurado } from "./supabase";
import { categoriasDe, enCategoria, imagenCategoria, norm, stockNum } from "./productos";

// Fila de la base -> objeto del panel.
export function categoriaDesdeDb(c) {
  return {
    id: c.id,
    nombre: c.nombre,
    palabra: c.coincide_con,
    imagen: c.imagen || "",
    orden: c.orden,
    visible: c.visible,
  };
}

// Palabra sugerida a partir del nombre: minúsculas y sin tildes («Portátiles» -> «portatiles»).
export const palabraDe = (nombre) => norm(nombre).replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();

// Categorías visibles para la web, con su conteo e imagen; las que no agrupan ningún producto
// publicado no se muestran. Si Supabase no está configurado, la tabla está vacía o falla, se
// arman desde los productos como antes (modo demo).
export async function getCategoriasPublicas(rows) {
  if (supabaseConfigurado()) {
    try {
      const { data, error } = await publicClient().from("categorias").select("*").order("orden").order("nombre");
      if (!error && data?.length) {
        return data.map((c) => {
          const suyos = rows.filter((r) => enCategoria(r, c.coincide_con));
          return {
            nombre: c.nombre,
            filtro: c.coincide_con,
            img: c.imagen || imagenCategoria(c.coincide_con) || imagenCategoria(c.nombre),
            total: suyos.length,
            disponibles: suyos.filter((r) => stockNum(r) > 0).length,
          };
        }).filter((c) => c.total > 0);
      }
    } catch {
      // Sigue con el respaldo.
    }
  }
  return categoriasDe(rows);
}

// ---------- Panel (con el token de la sesión; la RLS solo deja escribir al autenticado) ----------

function check({ error, data }) {
  if (error) throw new Error("Supabase: " + error.message);
  return data;
}

export async function listarCategorias(token) {
  const data = check(await userClient(token).from("categorias").select("*").order("orden").order("nombre"));
  return data.map(categoriaDesdeDb);
}

// Valida nombre y palabra, y que no se repitan (sin tildes ni mayúsculas). Devuelve el error o "".
async function validar(token, { nombre, palabra }, idActual) {
  if (!String(nombre || "").trim()) return "Escribe el nombre de la categoría.";
  if (!palabraDe(palabra)) return "Escribe la palabra que agrupa los productos (por ejemplo: portatil).";
  const otras = (await listarCategorias(token)).filter((c) => c.id !== idActual);
  if (otras.some((c) => norm(c.nombre).trim() === norm(nombre).trim())) return `Ya existe una categoría llamada «${nombre.trim()}».`;
  if (otras.some((c) => palabraDe(c.palabra) === palabraDe(palabra))) return `La palabra «${palabraDe(palabra)}» ya la usa otra categoría.`;
  return "";
}

export async function crearCategoria(token, { nombre, palabra }) {
  const error = await validar(token, { nombre, palabra });
  if (error) return { error };
  const actuales = await listarCategorias(token);
  const orden = actuales.reduce((m, c) => Math.max(m, c.orden || 0), 0) + 1;
  const fila = check(await userClient(token).from("categorias")
    .insert({ nombre: nombre.trim(), coincide_con: palabraDe(palabra), orden, visible: true })
    .select().single());
  return { categoria: categoriaDesdeDb(fila) };
}

export async function actualizarCategoria(token, id, campos) {
  const cambio = {};
  if ("nombre" in campos || "palabra" in campos) {
    const actual = (await listarCategorias(token)).find((c) => c.id === id);
    if (!actual) return { error: "La categoría ya no existe. Recarga la página." };
    const nombre = "nombre" in campos ? campos.nombre : actual.nombre;
    const palabra = "palabra" in campos ? campos.palabra : actual.palabra;
    const error = await validar(token, { nombre, palabra }, id);
    if (error) return { error };
    cambio.nombre = nombre.trim();
    cambio.coincide_con = palabraDe(palabra);
  }
  if ("visible" in campos) cambio.visible = Boolean(campos.visible);
  if ("orden" in campos) cambio.orden = Math.trunc(Number(campos.orden) || 0);
  const fila = check(await userClient(token).from("categorias").update(cambio).eq("id", id).select().single());
  return { categoria: categoriaDesdeDb(fila) };
}

// Intercambia el orden de dos categorías (flechas Subir/Bajar).
export async function intercambiarOrden(token, idA, idB) {
  const todas = await listarCategorias(token);
  const a = todas.find((c) => c.id === idA), b = todas.find((c) => c.id === idB);
  if (!a || !b) return { error: "La categoría ya no existe. Recarga la página." };
  // Si dos tienen el mismo orden, se renumera la lista completa antes de intercambiar.
  let lista = todas;
  if (new Set(todas.map((c) => c.orden)).size !== todas.length) {
    lista = todas.map((c, i) => ({ ...c, orden: i + 1 }));
    for (const c of lista) check(await userClient(token).from("categorias").update({ orden: c.orden }).eq("id", c.id));
  }
  const oa = lista.find((c) => c.id === idA).orden, ob = lista.find((c) => c.id === idB).orden;
  check(await userClient(token).from("categorias").update({ orden: ob }).eq("id", idA));
  check(await userClient(token).from("categorias").update({ orden: oa }).eq("id", idB));
  return { ok: true };
}

// Quitar una categoría no toca los productos: conservan su texto y siguen en el catálogo y la
// búsqueda; solo dejan de agruparse en esta categoría.
export async function quitarCategoria(token, id) {
  check(await userClient(token).from("categorias").delete().eq("id", id));
  return { ok: true };
}
